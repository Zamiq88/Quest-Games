"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include,re_path
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.views.generic.base import TemplateView
from django.contrib.sitemaps.views import sitemap
from .sitemaps import StaticViewSitemap, GameSitemap

sitemaps = {
    'static': StaticViewSitemap,
    'games': GameSitemap,  # If you have games
}


urlpatterns = [
    path('admin/', admin.site.urls),
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='sitemap'),
    path('robots.txt', TemplateView.as_view(template_name='robots.txt', content_type='text/plain')),
    path('',include('user.urls',namespace='user')),
    path('api/games/',include('games.urls',namespace='games')),
    re_path(r'^.*/$', TemplateView.as_view(template_name='index.html')),

]
if settings.DEBUG:
    # This serves files from STATICFILES_DIRS
    urlpatterns += staticfiles_urlpatterns()
    
    # This serves media files
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static('/assets/', document_root=settings.BASE_DIR / 'static/assets')