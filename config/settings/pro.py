from config.settings.com import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'mydatabase',           # Your database name
        'USER': 'myuser',               # Your database user
        'PASSWORD': 'questgames',       # Your database password
        'HOST': 'localhost',            # Database host
        'PORT': '5432',                 # Database port (default is 5432)
        'OPTIONS': {
            'connect_timeout': 20,
        },
    }
}

ALLOWED_HOSTS=['vidadenoche.com','www.vidadenoche.com','143.110.234.145','localhost']

BASE_URL = 'https://vidadenoche.com'