from django.shortcuts import render

# Create your views here.
# complaints/views.py
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import timedelta
from .models import Complaint, ComplaintUpdate, ComplaintAttachment
from .serializers import (
    ComplaintListSerializer,
    ComplaintDetailSerializer,
    ComplaintCreateSerializer,
    ComplaintUpdateSerializer as ComplaintUpdateModelSerializer,
    ComplaintStatsSerializer,
    BulkSyncSerializer,
    ComplaintUpdateSerializer,
    ComplaintAttachmentSerializer
)

class ComplaintListCreateView(generics.ListCreateAPIView):
    """List all complaints or create a new complaint"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ComplaintCreateSerializer
        return ComplaintListSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Complaint.objects.select_related('submitted_by', 'assigned_to')
        
        # Filter based on user role
        if user.role == 'user':
            # Users can only see their own complaints
            queryset = queryset.filter(submitted_by=user)
        elif user.role == 'engineer':
            # Engineers can see assigned complaints and unassigned ones
            queryset = queryset.filter(
                Q(assigned_to=user) | Q(assigned_to__isnull=True)
            )
        # Admins can see all complaints (no additional filter)
        
        # Apply filters from query parameters
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        priority_filter = self.request.query_params.get('priority')
        if priority_filter:
            queryset = queryset.filter(priority=priority_filter)
        
        category_filter = self.request.query_params.get('category')
        if category_filter:
            queryset = queryset.filter(category=category_filter)
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search) |
                Q(location__icontains=search)
            )
        
        return queryset.order_by('-created_at')

class ComplaintDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a complaint"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ComplaintUpdateModelSerializer
        return ComplaintDetailSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Complaint.objects.select_related('submitted_by', 'assigned_to')
        
        if user.role == 'user':
            # Users can only access their own complaints
            return queryset.filter(submitted_by=user)
        elif user.role == 'engineer':
            # Engineers can access assigned complaints
            return queryset.filter(
                Q(assigned_to=user) | Q(assigned_to__isnull=True)
            )
        # Admins can access all complaints
        return queryset

class MyComplaintsView(generics.ListAPIView):
    """Get current user's complaints"""
    serializer_class = ComplaintListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Complaint.objects.filter(
            submitted_by=self.request.user
        ).select_related('submitted_by', 'assigned_to').order_by('-created_at')

class AssignedComplaintsView(generics.ListAPIView):
    """Get complaints assigned to current engineer"""
    serializer_class = ComplaintListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role != 'engineer':
            return Complaint.objects.none()
        
        return Complaint.objects.filter(
            assigned_to=user
        ).select_related('submitted_by', 'assigned_to').order_by('-created_at')

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def assign_complaint(request, complaint_id):
    """Assign a complaint to an engineer (Admin only)"""
    if request.user.role != 'admin':
        return Response(
            {'error': 'Only admins can assign complaints'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        complaint = Complaint.objects.get(id=complaint_id)
    except Complaint.DoesNotExist:
        return Response(
            {'error': 'Complaint not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    engineer_id = request.data.get('engineer_id')
    if not engineer_id:
        return Response(
            {'error': 'Engineer ID is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        from accounts.models import User
        engineer = User.objects.get(id=engineer_id, role='engineer')
    except User.DoesNotExist:
        return Response(
            {'error': 'Engineer not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Update complaint
    old_assigned = complaint.assigned_to
    complaint.assigned_to = engineer
    complaint.status = 'assigned'
    complaint.assigned_at = timezone.now()
    complaint.save()
    
    # Create update record
    ComplaintUpdate.objects.create(
        complaint=complaint,
        updated_by=request.user,
        update_type='assignment',
        message=f"Assigned to {engineer.get_full_name()}"
    )
    
    return Response({
        'message': f'Complaint assigned to {engineer.get_full_name()}',
        'complaint': ComplaintDetailSerializer(complaint).data
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_complaint_status(request, complaint_id):
    """Update complaint status"""
    try:
        complaint = Complaint.objects.get(id=complaint_id)
    except Complaint.DoesNotExist:
        return Response(
            {'error': 'Complaint not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check permissions
    user = request.user
    if (user.role == 'user' and complaint.submitted_by != user) or \
       (user.role == 'engineer' and complaint.assigned_to != user):
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    new_status = request.data.get('status')
    resolution_notes = request.data.get('resolution_notes', '')
    
    if not new_status:
        return Response(
            {'error': 'Status is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    old_status = complaint.status
    complaint.status = new_status
    
    if resolution_notes:
        complaint.resolution_notes = resolution_notes
    
    if new_status == 'resolved':
        complaint.resolved_at = timezone.now()
    
    complaint.save()
    
    # Create update record
    ComplaintUpdate.objects.create(
        complaint=complaint,
        updated_by=user,
        update_type='status_change',
        message=f"Status changed from {old_status} to {new_status}",
        old_status=old_status,
        new_status=new_status
    )
    
    return Response({
        'message': 'Complaint status updated successfully',
        'complaint': ComplaintDetailSerializer(complaint).data
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_complaint_comment(request, complaint_id):
    """Add a comment/update to a complaint"""
    try:
        complaint = Complaint.objects.get(id=complaint_id)
    except Complaint.DoesNotExist:
        return Response(
            {'error': 'Complaint not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    message = request.data.get('message')
    if not message:
        return Response(
            {'error': 'Message is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create update record
    update = ComplaintUpdate.objects.create(
        complaint=complaint,
        updated_by=request.user,
        update_type='comment',
        message=message
    )
    
    return Response({
        'message': 'Comment added successfully',
        'update': ComplaintUpdateSerializer(update).data
    }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def complaint_stats(request):
    """Get complaint statistics for dashboard"""
    user = request.user
    
    if user.role == 'admin':
        # Admin sees all complaints stats
        total = Complaint.objects.count()
        pending = Complaint.objects.filter(status='pending').count()
        assigned = Complaint.objects.filter(status='assigned').count()
        resolved = Complaint.objects.filter(status='resolved').count()
        high_priority = Complaint.objects.filter(priority='high').count()
        my_complaints = 0
    elif user.role == 'engineer':
        # Engineer sees assigned complaints stats
        assigned_complaints = Complaint.objects.filter(assigned_to=user)
        total = assigned_complaints.count()
        pending = assigned_complaints.filter(status='pending').count()
        assigned = assigned_complaints.filter(status='assigned').count()
        resolved = assigned_complaints.filter(status='resolved').count()
        high_priority = assigned_complaints.filter(priority='high').count()
        my_complaints = total
    else:
        # User sees their own complaints stats
        user_complaints = Complaint.objects.filter(submitted_by=user)
        total = user_complaints.count()
        pending = user_complaints.filter(status='pending').count()
        assigned = user_complaints.filter(status='assigned').count()
        resolved = user_complaints.filter(status='resolved').count()
        high_priority = user_complaints.filter(priority='high').count()
        my_complaints = total
    
    # Calculate average resolution time
    resolved_complaints = Complaint.objects.filter(
        status='resolved', 
        resolved_at__isnull=False
    )
    
    if resolved_complaints.exists():
        avg_time = resolved_complaints.aggregate(
            avg_time=Avg('resolved_at') - Avg('created_at')
        )['avg_time']
        if avg_time:
            days = avg_time.days
            hours = avg_time.seconds // 3600
            avg_resolution_time = f"{days}d {hours}h" if days > 0 else f"{hours}h"
        else:
            avg_resolution_time = "N/A"
    else:
        avg_resolution_time = "N/A"
    
    stats_data = {
        'total_complaints': total,
        'pending_complaints': pending,
        'assigned_complaints': assigned,
        'resolved_complaints': resolved,
        'high_priority_complaints': high_priority,
        'my_complaints': my_complaints,
        'avg_resolution_time': avg_resolution_time
    }
    
    return Response(stats_data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def bulk_sync_complaints(request):
    """Sync multiple offline complaints"""
    serializer = BulkSyncSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        result = serializer.save()
        return Response({
            'message': f"Successfully synced {len(result['complaints'])} complaints",
            'synced_count': len(result['complaints'])
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)