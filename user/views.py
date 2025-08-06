from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated,AllowAny
from games.models import Reservation
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Contacts
from .serializers import ContactsSerializer
from games.serializers import ReservationSerializer
from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.http import HttpResponse
from django.views import View
from django.utils import timezone



def home_view(request):
    print('view called')
    return render(request,'index.html')




@api_view(['GET'])
def get_contacts(request):
    """
    Получить контактную информацию
    """
    try:
        contacts = Contacts.objects.first()  # Получаем первую (единственную) запись
        if contacts:
            serializer = ContactsSerializer(contacts)
            return Response({
                'success': True,
                'data': serializer.data
            })
        else:
            return Response({
                'success': False,
                'message': 'Контактная информация не найдена'
            }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetReservations(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        print('userrrrr hereeeee', request.user)
        try:
            reservations = Reservation.objects.filter(user=request.user).order_by('-created_at')
            
            # Pass QuerySet as instance, not data
            serializer = ReservationSerializer(reservations, many=True)
            
            print('daaaatttaaaaaaa', serializer.data)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(e)
            return Response({
                'error': 'Failed to fetch reservations'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


@ensure_csrf_cookie
@require_http_methods(["GET"])
def get_csrf_token(request):
    """
    Return CSRF token for the client.
    This ensures the CSRF cookie is set.
    """
    token = get_token(request)
    return JsonResponse({'csrfToken': token})