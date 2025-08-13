
import os 
import environ
from pathlib import Path
from dotenv import load_dotenv
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

#npm install react-helmet-async


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/
load_dotenv()  # loads the configs from .env
env = environ.Env()
env.read_env('.env')
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY')

GEMINI_API_KEY = env('GEMINI_API_KEY')

# SECURITY WARNING: don't run with debug turned on in production!



DEBUG = env.bool('DEBUG', default=False)

CSRF_TRUSTED_ORIGINS = [
    "http://vidadenoche.com",
    "http://www.vidadenoche.com",
    "https://vidadenoche.com",
    "https://www.vidadenoche.com",
    "http://143.110.234.145",
   " http://127.0.0.1:8000"
]


CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",  
    "http://localhost:8000",
    "http://143.110.234.145",      
    "http://vidadenoche.com",
    "http://www.vidadenoche.com",
    "https://vidadenoche.com",
    "https://www.vidadenoche.com"
]
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        # ... other auth classes
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # Change this for production
   ],
}

CORS_ALLOW_CREDENTIALS = True


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sitemaps',
    'user.apps.UserConfig',
    'games.apps.GamesConfig',
    'billing.apps.BillingConfig',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders'
   
   
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': ['templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

from django.utils.translation import gettext_lazy as _

# Admin interface language (Russian for development/management)
LANGUAGE_CODE = 'ru'  # Admin will be in Russian
TIME_ZONE = 'Europe/Madrid'  # Spain timezone

# Internationalization settings
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Available languages for frontend (if you ever need them on backend)
LANGUAGES = [
    ('ru', _('Русский')),     # For admin
    ('en', _('English')),     # For frontend
    ('es', _('Español')),     # For frontend
    ('uk', _('Українська')),  # For frontend
]

# Locale paths for translation files
LOCALE_PATHS = [
    os.path.join(BASE_DIR, 'locale'),
]

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

STATICFILES_DIRS = [
    BASE_DIR / 'static',  # This will now point to the correct location
    
]

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'user.User'

SENDGRID_API_KEY = "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"

STRIPE_LIVE_MODE = False
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
}
STRIPE_WEBHOOK_SECRET = env('STRIPE_WEBHOOK_SECRET')
STRIPE_TEST_SECRET_KEY = env('STRIPE_TEST_SECRET_KEY')
STRIPE_TEST_PUBLIC_KEY = env('STRIPE_TEST_PUBLIC_KEY')


# import sentry_sdk

# sentry_sdk.init(
#     dsn="https://71f7f903cf36a68b5b82a28cde6ddddb@o4509310227382272.ingest.de.sentry.io/4509837389529168",
#     # Add data like request headers and IP for users,
#     # see https://docs.sentry.io/platforms/python/data-management/data-collected/ for more info
#     send_default_pii=True,
# )

