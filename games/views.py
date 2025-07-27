from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q
from django.utils.translation import gettext as _
from .models import Game
from .serializers import GameSerializer, FeaturedGameSerializer

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
