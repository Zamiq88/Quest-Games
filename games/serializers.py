from rest_framework import serializers
from .models import Game

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