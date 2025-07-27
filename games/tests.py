from django.test import TestCase

import requests

BASE_URL = 'https://api.textbee.dev/api/v1'
API_KEY = 'e06dbf4f-1842-4062-b273-665e45f529d7'
DEVICE_ID = '68860a276663bbd7fbb136b0'

response = requests.post(
  f'{BASE_URL}/gateway/devices/{DEVICE_ID}/send-sms',
  json={
    'recipients': ['+994509764354'],
    'message': 'Hello from TextBee!'
  },
  headers={'x-api-key': API_KEY}
)

print(response.json())
