from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q
from django.utils.translation import gettext as _
from .models import Game
from games.models import Reservation
from .serializers import GameSerializer, FeaturedGameSerializer,BookingSerializer,SendOTPSerializer,VerifyOTPSerializer
from rest_framework.decorators import api_view, permission_classes,authentication_classes
from rest_framework.permissions import AllowAny

from rest_framework import status
from django.http import JsonResponse
from .utils import get_available_times
from .serializers import AvailableTimesSerializer
import random
import string
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import login
from games.utils import sendgrid_send_email
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

def generate_otp():
    """Generate 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

class GameListAPIView(generics.ListAPIView):
    """API endpoint for games with language support"""
    queryset = Game.objects.filter(is_active=True)
    serializer_class = GameSerializer
    
    def get_serializer_context(self):
        """Pass language to serializer"""
        context = super().get_serializer_context()
        
        # Get language from query parameter or Accept-Language header
        language = self.request.GET.get('lang', 'en')
        
        # Validate language code
        valid_languages = ['en', 'es', 'uk']
        if language not in valid_languages:
            language = 'en'
        
        context['language'] = language
        return context

class FeaturedGamesView(generics.ListAPIView):
    """
    List only featured games
    """
    serializer_class = FeaturedGameSerializer
    queryset = Game.objects.filter(is_featured=True, is_active=True).order_by('category', 'title')

class GameDetailView(generics.RetrieveAPIView):

    """
    Get details of a specific game
    """
    permission_classes=[AllowAny]
    authentication_classes = []
    serializer_class = GameSerializer
    queryset = Game.objects.filter(is_active=True)
    lookup_field = 'id'

@api_view(['GET'])
def game_categories(request):
    """
    Get all available game categories
    """
    from .models import CATEGORY_CHOICES
    categories = [{'value': choice[0], 'label': choice[1]} for choice in CATEGORY_CHOICES]
    return Response(categories)

@api_view(['GET'])
def game_difficulties(request):
    """
    Get all available difficulty levels
    """
    from .models import DIFFICULTY_CHOICES
    difficulties = [{'value': choice[0], 'label': choice[1]} for choice in DIFFICULTY_CHOICES]
    return Response(difficulties)

@api_view(['GET'])
def game_stats(request):
    """
    Get general statistics about games
    """
    total_games = Game.objects.filter(is_active=True).count()
    featured_games = Game.objects.filter(is_featured=True, is_active=True).count()
    categories_count = Game.objects.filter(is_active=True).values('category').distinct().count()
    
    stats = {
        'total_games': total_games,
        'featured_games': featured_games,
        'categories_count': categories_count,
    }
    
    return Response(stats)



@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_available_times_api(request):
    """
    Get available time slots for a game on a specific date with capacity information
         
    Query parameters:
    - game_id: ID of the game
    - date: Date in YYYY-MM-DD format
    """
    game_id = request.GET.get('game_id')
    selected_date = request.GET.get('date')
         
    if not game_id or not selected_date:
        return Response({
            'error': 'game_id and date parameters are required'
        }, status=status.HTTP_400_BAD_REQUEST)
         
    result = get_available_times(game_id, selected_date)
         
    if 'error' in result:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
         
    # The new get_available_times function already returns time_slots with capacity info
    # No need to reformat - just pass through the data
    response_data = {
        'game_title': result['game_title'],
        'date': result['date'],
        'time_slots': result['time_slots'],  # Already formatted with capacity info
        'duration': result['duration'],
        'max_players': result['max_players']
    }
         
    return Response(response_data, status=status.HTTP_200_OK)


from rest_framework.views import APIView
@method_decorator(csrf_exempt, name='dispatch')
class SendOTPView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def get_language_from_request(self, request):
        """
        Extract language from request in priority order:
        1. Custom X-Language header (sent by your React app)
        2. Query parameter 'lang' (backup method)
        3. Accept-Language header  
        4. Session language
        5. Default to 'en'
        """
        
        # Method 1: Custom header (recommended for your React app)
        x_language = request.META.get('HTTP_X_LANGUAGE')
        if x_language:
            print(f'Language from X-Language header: {x_language}')
            return self.normalize_language(x_language)
        
        # Method 2: Query parameter (backup method)
        lang_param = request.GET.get('lang')
        if lang_param:
            print(f'Language from query param: {lang_param}')
            return self.normalize_language(lang_param)
        
        # Method 3: Accept-Language header
        accept_lang = request.META.get('HTTP_ACCEPT_LANGUAGE')
        if accept_lang:
            # Parse first language from "en-US,en;q=0.9,es;q=0.8"
            language = accept_lang.split(',')[0].split('-')[0]
            print(f'Language from Accept-Language: {language}')
            return self.normalize_language(language)
        
        # Method 4: Session
        if hasattr(request, 'session') and 'language' in request.session:
            language = request.session['language']
            print(f'Language from session: {language}')
            return self.normalize_language(language)
        
        # Method 5: Request object (if using Django's i18n middleware)
        if hasattr(request, 'LANGUAGE_CODE'):
            language = request.LANGUAGE_CODE
            print(f'Language from request.LANGUAGE_CODE: {language}')
            return self.normalize_language(language)
        
        # Default fallback
        print('Using default language: en')
        return 'en'
    
    def normalize_language(self, language):
        """
        Normalize language code to supported languages
        """
        if not language:
            return 'en'
            
        # Convert to lowercase and handle variants
        language = language.lower().strip()
        
        # Language mapping for variants
        language_map = {
            'en': 'en',
            'en-us': 'en',
            'en-gb': 'en',
            'es': 'es',
            'es-es': 'es',
            'es-mx': 'es',
            'uk': 'uk',
            'ua': 'uk',  # Ukrainian variants
            'ukr': 'uk',
        }
        
        # Get normalized language
        normalized = language_map.get(language, 'en')
        
        # Validate against supported languages
        supported_languages = ['en', 'es', 'uk']
        if normalized not in supported_languages:
            print(f'Unsupported language {normalized}, defaulting to en')
            return 'en'
            
        return normalized
    
    def post(self, request):
        print('=== CLASS-BASED DEBUG ===')
        print('Request method:', request.method)
        print('Request data:', request.data)
        print('Request headers:', dict(request.META))
        
        # Get language from request
        language = self.get_language_from_request(request)
        language_map = {
        'en': 'en',
        'es': 'es',
        'uk': 'uk',
        'ua': 'uk'  # Ukrainian variants
    }
        language = language_map.get(language,'en')
        # Validate language is supported
        supported_languages = ['en', 'es', 'uk',]
        if language not in supported_languages:
            print(f'Unsupported language {language}, defaulting to en')
            language = 'en'
        
        print(f'Final language selected: {language}')
        
        # Store language in session for consistency
        request.session['language'] = language
        
        # Your existing logic here
        serializer = SendOTPSerializer(data=request.data)
        
        if not serializer.is_valid():
            print('error', serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        first_name = serializer.validated_data['first_name']
        last_name = serializer.validated_data['last_name']
        
        # Generate OTP
        otp = generate_otp()
        print('otp:', otp)
        
        # Store OTP in session
        request.session['booking_otp'] = otp
        request.session['booking_email'] = email
        request.session['booking_first_name'] = first_name
        request.session['booking_last_name'] = last_name
        request.session.set_expiry(600)  # 10 minutes
        
        # Localized subjects
        subjects = {
            "en": "OTP Verification",
            "es": "Verificación OTP",
            "uk": "Підтвердження OTP"
        }
        
       

        
        template_data = {
            "spanish":language=="es",
            "ukrainian":language=="uk",
            "otp":otp,
           
            "subject":subjects[language],
  
        }
        
        
        print(f'Sending email with template data: {template_data}')
        
        # Send email
        email_sent = sendgrid_send_email(to_email=email, dynamic_template_data=template_data)
        
        if not email_sent:
            return Response({
                'error': 'Failed to send verification email. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'message': 'Verification code sent to your email',
            'email': email,
            'language': language,  # Include language in response
            'expires_in': 600  # 10 minutes in seconds
        }, status=status.HTTP_200_OK)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    """
    Send OTP to user's email
    
    POST data:
    {
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe"
    }
    """
    print('weee areee here')
    serializer = SendOTPSerializer(data=request.data)
    print('dataa',serializer.data)
    
    if not serializer.is_valid():
        print('errror',serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    first_name = serializer.validated_data['first_name']
    last_name = serializer.validated_data['last_name']
    
    # Generate OTP
    otp = generate_otp()
    print('otppp',otp)
    
    # Store OTP in session
    request.session['booking_otp'] = otp
    request.session['booking_email'] = email
    request.session['booking_first_name'] = first_name
    request.session['booking_last_name'] = last_name
    request.session.set_expiry(600)  # 10 minutes
    
    # Send email
    # email_sent = send_verification_email(email, otp, first_name)
    
    # if not email_sent:
    #     return Response({
    #         'error': 'Failed to send verification email. Please try again.'
    #     }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({
        'message': 'Verification code sent to your email',
        'email': email,
        'expires_in': 600  # 10 minutes in seconds
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def verify_otp(request):
    """
    Verify OTP code
    
    POST data:
    {
        "email": "user@example.com",
        "otp": "123456"
    }
    """
    serializer = VerifyOTPSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    otp = serializer.validated_data['otp']
    
    # Check session data
    stored_otp = request.session.get('booking_otp')
    stored_email = request.session.get('booking_email')
    stored_first_name = request.session.get('booking_first_name')
    stored_last_name = request.session.get('booking_last_name')
    
    if (not stored_otp or stored_email != email or stored_otp != otp):
        return Response({
            'error': 'Invalid or expired verification code'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'message': 'Email verified successfully',
        'verified': True,
        'user_data': {
            'email': stored_email,
            'first_name': stored_first_name,
            'last_name': stored_last_name
        }
    }, status=status.HTTP_200_OK)




@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def create_booking(request):
    """
    Create final booking after email verification
         
    POST data:
    {
        "game": 1,
        "date": "2025-07-29",
        "time": "14:00",
        "players": 4,
        "special_requirements": "Birthday celebration",
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe"
    }
    """
         
    # Verify that email was verified in this session
    stored_email = request.session.get('booking_email')
    submitted_email = request.data.get('email')
    print(stored_email,submitted_email)
         
    if not stored_email or stored_email != submitted_email:
        print(stored_email,submitted_email)
        return Response({
            'error': 'Email not verified. Please verify your email first.'
        }, status=status.HTTP_400_BAD_REQUEST)
         
    serializer = BookingSerializer(data=request.data, context={'request': request})
         
    if not serializer.is_valid():
        print('serializer problem')
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
         
    try:
        # Create reservation
        reservation = serializer.save()
        reservation.status = 'pending'
        reservation.save()
        
        # Generate JWT tokens for the user
        tokens = None
        if reservation.user:
            refresh = RefreshToken.for_user(reservation.user)
            tokens = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        
        language = request.GET.get('lang')
                
        language_map = {
            'en': 'en',
            'es': 'es',
            'uk': 'uk',
            'ua': 'uk'  # Ukrainian variants
        }
        language = language_map.get(language, 'en')
        
        subjects = {
            "en": "Booking Confirmed",
            "es": "Reserva Confirmada", 
            "uk": "Бронювання Підтверджено"
        }
        
        template_data = {
            "game_title": reservation.game.title[language],
            "spanish": language == "es",
            "ukrainian": language == "uk", 
            "date": reservation.date.strftime("%B %d, %Y"),  # Convert to string
            "time": reservation.time.strftime("%I:%M %p"),   # Convert to string
            "subject": subjects[language],
        }
        
        email_sent = sendgrid_send_email(
            to_email=submitted_email, 
            dynamic_template_data=template_data,
            template_id='d-f0aa12f4f2944b61a8d004d96560efbe'
        )
        
        if not email_sent:
            print("email couldn't be sent")
                 
        response_data = {
            'success': True,
            'message': 'Booking created successfully!',
            'user_authenticated': reservation.user is not None,
            'reservation': {
                'reference_number': reservation.reference_number,
                'game': reservation.game.get_title('en'),
                'date': reservation.date.strftime('%Y-%m-%d'),
                'time': reservation.time.strftime('%H:%M'),
                'players': reservation.players,
                'total_price': float(reservation.total_price),
                'email': reservation.email,
                'id': int(reservation.pk)
            }
        }
        
        # Add tokens to response if user exists
        if tokens:
            response_data['tokens'] = tokens
            response_data['user'] = {
                'id': reservation.user.id,
                'email': reservation.user.email,
                'first_name': reservation.user.first_name,
                'last_name': reservation.user.last_name,
            }
                 
        return Response(response_data, status=status.HTTP_201_CREATED)
             
    except Exception as e:
        return Response({
            'error': f'Failed to create booking: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)