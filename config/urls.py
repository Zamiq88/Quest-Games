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
from django.http import HttpResponse
from django.views import View
from django.utils import timezone

sitemaps = {
    'static': StaticViewSitemap,
    'games': GameSitemap,  # If you have games
}
class SitemapXMLView(View):
    def get(self, request):
        # Always use production domain
        base_url = 'https://vidadenoche.com'
        current_date = timezone.now().strftime('%Y-%m-%d')

        # Simple sitemap with just main pages - no individual games
        sitemap_xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
    <url>
        <loc>{base_url}/</loc>
        <lastmod>{current_date}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
        <xhtml:link rel="alternate" hreflang="es" href="{base_url}/"/>
        <xhtml:link rel="alternate" hreflang="en" href="{base_url}/en/"/>
        <xhtml:link rel="alternate" hreflang="uk" href="{base_url}/uk/"/>
    </url>
    <url>
        <loc>{base_url}/games/</loc>
        <lastmod>{current_date}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
        <xhtml:link rel="alternate" hreflang="es" href="{base_url}/games/"/>
        <xhtml:link rel="alternate" hreflang="en" href="{base_url}/en/games/"/>
        <xhtml:link rel="alternate" hreflang="uk" href="{base_url}/uk/games/"/>
    </url>
    <url>
        <loc>{base_url}/contact/</loc>
        <lastmod>{current_date}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
        <xhtml:link rel="alternate" hreflang="es" href="{base_url}/contact/"/>
        <xhtml:link rel="alternate" hreflang="en" href="{base_url}/en/contact/"/>
        <xhtml:link rel="alternate" hreflang="uk" href="{base_url}/uk/contact/"/>
    </url>
    <url>
        <loc>{base_url}/reservations/</loc>
        <lastmod>{current_date}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
        <xhtml:link rel="alternate" hreflang="es" href="{base_url}/reservations/"/>
        <xhtml:link rel="alternate" hreflang="en" href="{base_url}/en/reservations/"/>
        <xhtml:link rel="alternate" hreflang="uk" href="{base_url}/uk/reservations/"/>
    </url>
</urlset>'''
        
        return HttpResponse(sitemap_xml, content_type='application/xml')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('sitemap.xml', SitemapXMLView.as_view(), name='sitemap'),
    path('robots.txt', TemplateView.as_view(template_name='robots.txt', content_type='text/plain')),
    path('',include('user.urls',namespace='user')),
    path('api/games/',include('games.urls',namespace='games')),
    path('billing/',include('billing.urls',namespace='billing')),
    re_path(r'^(?!sitemap\.xml|robots\.txt).*$', TemplateView.as_view(template_name='index.html')),

]
if settings.DEBUG:
    # This serves files from STATICFILES_DIRS
    urlpatterns += staticfiles_urlpatterns()
    
    # This serves media files
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static('/assets/', document_root=settings.BASE_DIR / 'static/assets')