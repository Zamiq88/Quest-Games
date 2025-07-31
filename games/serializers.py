from rest_framework import serializers
from .models import Game
from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError

User = get_user_model()

class GameSerializer(serializers.ModelSerializer):
    """Serializer for API - returns data for frontend with language-specific content"""
    
    # Add computed fields for current language
    title_localized = serializers.SerializerMethodField()
    description_localized = serializers.SerializerMethodField()
    
    class Meta:
        model = Game
        fields = [
            'id', 'title', 'description', 'title_localized', 'description_localized',
            'category', 'difficulty', 'status', 'image', 'price', 
            'max_players', 'duration', 'working_hours_start', 
            'working_hours_end', 'is_featured', 'is_active'
        ]
    
    def get_title_localized(self, obj):
        """Get title in the requested language"""
        language = self.context.get('language', 'en')
        return obj.get_title(language)
    
    def get_description_localized(self, obj):
        """Get description in the requested language"""
        language = self.context.get('language', 'en')
        return obj.get_description(language)
    
    def to_representation(self, instance):
        """Customize output for frontend"""
        data = super().to_representation(instance)
        
        # Only return active games
        if not instance.is_active:
            return None
        
        # Get language from context (set in view)
        language = self.context.get('language', 'en')
        
        # Replace title and description with localized versions
        data['title'] = instance.get_title(language)
        data['description'] = instance.get_description(language)
        
        # Format working hours for frontend
        if instance.working_hours_start and instance.working_hours_end:
            data['working_hours'] = f"{instance.working_hours_start}-{instance.working_hours_end}"
        
        return data
    
    def get_image_url(self, obj):
        """
        Get full URL for the image
        """
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

class FeaturedGameSerializer(GameSerializer):
    """
    Serializer for featured games with additional fields if needed
    """
    class Meta(GameSerializer.Meta):
        pass

from rest_framework import serializers
from .models import Game, Reservation

class TimeSlotSerializer(serializers.Serializer):
    time = serializers.CharField()
    available = serializers.BooleanField()

class AvailableTimesSerializer(serializers.Serializer):
    game_title = serializers.CharField()
    date = serializers.DateField()
    available_slots = TimeSlotSerializer(many=True)
    duration = serializers.IntegerField()
    max_players = serializers.IntegerField()
    error = serializers.CharField(required=False)


    
class SendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    
    def validate_email(self, value):
        try:
            validate_email(value)
        except DjangoValidationError:
            raise serializers.ValidationError("Please enter a valid email address")
        return value.lower()

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)
    
    def validate_otp(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("OTP must be 6 digits")
        return value

class BookingSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(max_length=150, write_only=True)
    last_name = serializers.CharField(max_length=150, write_only=True)
    email = serializers.EmailField(write_only=True)
    
    class Meta:
        model = Reservation
        fields = [
            'game', 'date', 'time', 'players', 'special_requirements',
            'first_name', 'last_name', 'email'
        ]
    
    def create(self, validated_data):
        # Extract user data
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        email = validated_data.pop('email')
        
        # Create or get user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': first_name,
                'last_name': last_name
            }
        )
        
        # Update user info if needed
        if not created:
            if not user.first_name and first_name:
                user.first_name = first_name
            if not user.last_name and last_name:
                user.last_name = last_name
            user.save()
        
        # Create reservation
        validated_data['user'] = user
        validated_data['email'] = email
        
        return super().create(validated_data)
    
class ReservationSerializer(serializers.ModelSerializer):
    game = GameSerializer(read_only=True)  # Include game details
    
    class Meta:
        model = Reservation
        fields = [
            'id', 'reference_number', 'game', 'date', 'time', 
            'players', 'total_price', 'status', 'special_requirements',
            'created_at'
        ]