from django.urls import path
from .views import NotificationListView, NotificationMarkReadView, mark_all_read, unread_count, clear_notifications

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/read/', NotificationMarkReadView.as_view(), name='notification-mark-read'),
    path('mark-all-read/', mark_all_read, name='notification-mark-all-read'),
    path('unread-count/', unread_count, name='notification-unread-count'),
    path('clear/', clear_notifications, name='notifications-clear'),
]