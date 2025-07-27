import os
from django.core.wsgi import get_wsgi_application
from dotenv import load_dotenv



load_dotenv()
print(f"Loaded .env file")

ENVIRONMENT = os.getenv('ENVIRONMENT', 'dev')


settings_module = f'config.settings.{ENVIRONMENT}'


os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_module)



application = get_wsgi_application()
