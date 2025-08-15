from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only notifications for the logged-in user
        return Notification.objects.filter(
            recipient=self.request.user
        ).order_by('-created_at')


class NotificationMarkReadView(generics.UpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only allow marking your own notifications
        return Notification.objects.filter(recipient=self.request.user)

    def perform_update(self, serializer):
        serializer.save(read=True)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_read(request):
    """
    Mark all unread notifications for this user as read
    """
    Notification.objects.filter(recipient=request.user, read=False).update(read=True)
    return Response({"message": "All notifications marked as read"})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def unread_count(request):
    """
    Return number of unread notifications for this user
    """
    count = Notification.objects.filter(recipient=request.user, read=False).count()
    return Response({"unread_count": count})


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def clear_notifications(request):
    """
    Completely delete all notifications for the current user
    """
    Notification.objects.filter(recipient=request.user).delete()
    return Response({"message": "All notifications cleared"})
