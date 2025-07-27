from rest_framework import serializers
from .models import Game

class GameSerializer(serializers.ModelSerializer):
    """
    Serializer for Game model
    """
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Game
        fields = [
            'id', 'title', 'description', 'category', 'difficulty', 
            'status', 'image', 'image_url', 'price', 'max_players', 
            'duration', 'working_hours_start', 'working_hours_end',
            'is_featured', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
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