from django.urls import path
from django.contrib.sitemaps.views import sitemap
# from apps.web.utils.sitemaps import StaticSitemap
from user.views import home_view


app_name = 'user'


# sitemaps = {"static": StaticSitemap,
#             }

urlpatterns = [
    # path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
    path('', view=home_view, name='home_view'),
    
]