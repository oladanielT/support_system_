from django.urls import path
from . import views

urlpatterns = [
    path('', views.ComplaintListCreateView.as_view(), name='complaint-list-create'),
    path('<int:pk>/', views.ComplaintDetailView.as_view(), name='complaint-detail'),
    path('my-complaints/', views.MyComplaintsView.as_view(), name='my-complaints'),
    path('assigned-complaints/', views.AssignedComplaintsView.as_view(), name='assigned-complaints'),
    path('<int:complaint_id>/assign/', views.assign_complaint, name='assign-complaint'),
    path('<int:complaint_id>/status/', views.update_complaint_status, name='update-complaint-status'),
    path('<int:complaint_id>/comment/', views.add_complaint_comment, name='add-complaint-comment'),
    path('stats/', views.complaint_stats, name='complaint-stats'),
    path('bulk-sync/', views.bulk_sync_complaints, name='bulk-sync-complaints'),
]