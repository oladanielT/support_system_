from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    is_read = serializers.BooleanField(source='read')

    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created_at']
