from django.urls import path
from django.contrib.sitemaps.views import sitemap
# from apps.web.utils.sitemaps import StaticSitemap
from user.views import home_view
from user.views import get_contacts
from user.views import GetReservations
from user.views import get_csrf_token
from user.views import RetrieveReservation



app_name = 'user'
def trigger_error(request):
    division_by_zero = 1 / 0


# sitemaps = {"static": StaticSitemap,
#             }

urlpatterns = [
    # path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
    path('', view=home_view, name='home_view'),
     path('api/contacts/', get_contacts, name='get_contacts'),
     path('api/reservations/',GetReservations.as_view(),name='get-reservations'),
     path('api/reservations/<int:pk>',RetrieveReservation.as_view(),name='get-reservation'),
     path('api/csrf-token/', get_csrf_token, name='csrf_token'),
     path('sentry-debug/', trigger_error)

    
]