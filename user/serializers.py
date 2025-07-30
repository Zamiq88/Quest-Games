from rest_framework import serializers
from .models import Contacts

class ContactsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contacts
        fields = ['facebook_page', 'instagram_page', 'whatsapp_number', 'email','address']