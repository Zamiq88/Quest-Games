from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q
from django.utils.translation import gettext as _
from .models import Game
from games.models import Reservation
from .serializers import GameSerializer, FeaturedGameSerializer,BookingSerializer,SendOTPSerializer,VerifyOTPSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

from rest_framework import status
from django.http import JsonResponse
from .utils import get_available_times
from .serializers import AvailableTimesSerializer
import random
import string

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
@permission_classes([AllowAny])
def get_available_times_api(request):
    """
    Get available time slots for a game on a specific date
    
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
    
    # Format response for frontend
    time_slots = []
    for slot in result['all_slots']:
        time_slots.append({
            'time': slot,
            'available': slot in result['available_slots']
        })
    
    response_data = {
        'game_title': result['game_title'],
        'date': result['date'],
        'time_slots': time_slots,
        'duration': result['duration'],
        'max_players': result['max_players']
    }
    
    return Response(response_data, status=status.HTTP_200_OK)

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
    serializer = SendOTPSerializer(data=request.data)
    
    if not serializer.is_valid():
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
    
    if not stored_email or stored_email != submitted_email:
        return Response({
            'error': 'Email not verified. Please verify your email first.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = BookingSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Create reservation
        reservation = serializer.save()
        
        # Send confirmation email
        # send_booking_confirmation_email(reservation)
        
        # Clear session data
        request.session.flush()
        
        return Response({
            'success': True,
            'message': 'Booking created successfully!',
            'reservation': {
                'reference_number': reservation.reference_number,
                'game': reservation.game.get_title('en'),
                'date': reservation.date.strftime('%Y-%m-%d'),
                'time': reservation.time.strftime('%H:%M'),
                'players': reservation.players,
                'total_price': float(reservation.total_price),
                'email': reservation.email
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': f'Failed to create booking: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)