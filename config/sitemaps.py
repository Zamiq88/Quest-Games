from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from django.utils import timezone

class StaticViewSitemap(Sitemap):
    priority = 1.0
    changefreq = 'weekly'
    protocol = 'https'

    def items(self):
        return [
            'home',
            'games', 
            'contact',
            'reservations'
        ]

    def location(self, item):
        if item == 'home':
            return '/'
        return f'/{item}/'

    def lastmod(self, obj):
        return timezone.now()

# If you have a games model:
class GameSitemap(Sitemap):
    changefreq = 'weekly'
    priority = 0.8
    protocol = 'https'

    def items(self):
        # Replace with your actual Game model
        from games.models import Game
        return Game.objects.filter(status='available_now')

    def location(self, obj):
        return f'/games/{obj.id}/'

    def lastmod(self, obj):
        return obj.updated_at