from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q
from django.utils.translation import gettext as _
from .models import Game
from .serializers import GameSerializer, FeaturedGameSerializer

class GameListView(generics.ListAPIView):
    """
    List all active games
    """
    serializer_class = GameSerializer
    
    def get_queryset(self):
        queryset = Game.objects.filter(is_active=True)
        
        # Filter by category if provided
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by difficulty if provided
        difficulty = self.request.query_params.get('difficulty')
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search)
            )
        
        return queryset.order_by('-is_featured', 'category', 'title')

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
