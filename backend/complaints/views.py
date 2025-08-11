from django.shortcuts import render
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import timedelta
from users.models import User
from .models import Complaint, ComplaintUpdate, ComplaintAttachment
from .serializers import (
    ComplaintListSerializer,
    ComplaintDetailSerializer,
    ComplaintCreateSerializer,
    ComplaintStatusUpdateSerializer,
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
        """FIXED: Admin can now see all complaints"""
        user = self.request.user
        queryset = Complaint.objects.select_related('submitted_by', 'assigned_to')

        # Role-based filtering - FIXED ADMIN ACCESS
        if user.role == 'user':
            queryset = queryset.filter(submitted_by=user)
        elif user.role == 'engineer':
            queryset = queryset.filter(assigned_to=user)
        # ADMINS can see all complaints - no filtering

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
            return ComplaintStatusUpdateSerializer  # CHANGED: Updated name
        return ComplaintDetailSerializer

    def get_queryset(self):
        """FIXED: Admin access"""
        user = self.request.user
        queryset = Complaint.objects.select_related('submitted_by', 'assigned_to')

        if user.role == 'user':
            return queryset.filter(submitted_by=user)
        elif user.role == 'engineer':
            return queryset.filter(assigned_to=user)
        # ADMINS can access all complaints

        return queryset
    
    def perform_destroy(self, instance):
        """ENHANCED: Proper deletion logging"""
        ComplaintUpdate.objects.create(
            complaint=instance,
            updated_by=self.request.user,
            update_type='status_change',
            message=f"Complaint deleted by {self.request.user.get_full_name()}",
            old_status=instance.status,
            new_status='deleted'
        )
        super().perform_destroy(instance)

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

@api_view(['POST', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def assign_complaint(request, complaint_id):
    """ENHANCED: Better error handling"""
    if request.user.role != 'admin':
        return Response(
            {
                'error': 'Access denied',
                'message': 'Only administrators can assign complaints'
            },
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
        from users.models import User
        engineer = User.objects.get(id=engineer_id, role='engineer')
    except User.DoesNotExist:
        return Response(
            {'error': 'Engineer not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Update complaint
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
        'success': True,
        'message': f'Complaint assigned to {engineer.get_full_name()}',
        'complaint': ComplaintDetailSerializer(complaint).data
    }, status=status.HTTP_200_OK)

@api_view(['POST', 'PATCH'])
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
    """FIXED: Proper admin statistics"""
    user = request.user

    if user.role == 'admin':
        # Admin sees all complaints stats
        total = Complaint.objects.count()
        pending = Complaint.objects.filter(status='pending').count()
        assigned = Complaint.objects.filter(status='assigned').count()
        resolved = Complaint.objects.filter(status='resolved').count()
        high_priority = Complaint.objects.filter(priority='high').count()
        my_complaints = 0
        base_queryset = Complaint.objects
        
    elif user.role == 'engineer':
        assigned_complaints = Complaint.objects.filter(assigned_to=user)
        total = assigned_complaints.count()
        pending = assigned_complaints.filter(status='pending').count()
        assigned = assigned_complaints.filter(status='assigned').count()
        resolved = assigned_complaints.filter(status='resolved').count()
        high_priority = assigned_complaints.filter(priority='high').count()
        my_complaints = total
        base_queryset = assigned_complaints
        
    else:  # user role
        user_complaints = Complaint.objects.filter(submitted_by=user)
        total = user_complaints.count()
        pending = user_complaints.filter(status='pending').count()
        assigned = user_complaints.filter(status='assigned').count()
        resolved = user_complaints.filter(status='resolved').count()
        high_priority = user_complaints.filter(priority='high').count()
        my_complaints = total
        base_queryset = user_complaints

    # FIXED: Better average resolution time calculation
    resolved_complaints = base_queryset.filter(
        status='resolved',
        resolved_at__isnull=False,
        created_at__isnull=False
    )
    
    if resolved_complaints.exists():
        total_time = timedelta()
        count = 0
        
        for complaint in resolved_complaints:
            if complaint.resolved_at and complaint.created_at:
                total_time += complaint.resolved_at - complaint.created_at
                count += 1
        
        if count > 0:
            avg_time = total_time / count
            days = avg_time.days
            hours = avg_time.seconds // 3600
            avg_resolution_time = f"{days}d {hours}h" if days > 0 else f"{hours}h"
        else:
            avg_resolution_time = "N/A"
    else:
        avg_resolution_time = "N/A"

    if user.role == 'admin':
        active_engineers = User.objects.filter(role='engineer', is_active=True).count()
    else:
        active_engineers = 0

    return Response({
        'total_complaints': total,
        'pending_complaints': pending,
        'assigned_complaints': assigned,
        'resolved_complaints': resolved,
        'high_priority_complaints': high_priority,
        'my_complaints': my_complaints,
        'avg_resolution_time': avg_resolution_time,
        'active_engineers': active_engineers,
    }, status=status.HTTP_200_OK)

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


    