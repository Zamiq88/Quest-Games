from django.urls import path, include
from . import views

app_name = 'games'

urlpatterns = [
    # Game endpoints
    path('', views.GameListAPIView.as_view(), name='game-list'),
    path('<int:id>/', views.GameDetailView.as_view(), name='game-detail'),
    path('featured/', views.FeaturedGamesView.as_view(), name='featured-games'),
    
    # Utility endpoints
    path('categories/', views.game_categories, name='game-categories'),
    path('difficulties/', views.game_difficulties, name='game-difficulties'),
    path('stats/', views.game_stats, name='game-stats'),
]