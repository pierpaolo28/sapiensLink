# middleware.py
from datetime import datetime
from django.utils import timezone
from django.contrib.sessions.models import Session
from django.contrib.sessions.backends.db import SessionStore
from .models import RevokedToken
from rest_framework.response import Response
from rest_framework import status

# TODO: On frontend use Axios interceptors to detect 401 responses and decide 
# if users should be logged out, redirected to login or the token can be refreshed
class TokenRevocationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        token = self.extract_token_from_session(request)
        if token and self.is_token_revoked(token):
            return Response({'detail': 'Token is revoked'}, status=status.HTTP_401_UNAUTHORIZED)

        response = self.get_response(request)
        return response

    def extract_token_from_session(self, request):
        # Extract the token from the session
        authorization_header = request.headers.get('Authorization')
        if authorization_header and authorization_header.startswith('Bearer '):
            return authorization_header.split(' ')[1]
        return None

    def is_token_revoked(self, token):
        # Check if the token is in the blacklist
        now = timezone.now()
        return RevokedToken.objects.filter(token=token, expiration_date__lt=now).exists()
