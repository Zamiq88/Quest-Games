from django.shortcuts import render

def home_view(request):
    print('view called')
    return render(request,'index.html')


from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Contacts
from .serializers import ContactsSerializer

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
