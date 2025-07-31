# complaints/serializers.py
from rest_framework import serializers
from django.utils import timezone
from users.serializers import UserRegistrationSerializer as UserSerializer, UserProfileSerializer
from .models import Complaint, ComplaintUpdate, ComplaintAttachment


class ComplaintAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    
    class Meta:
        model = ComplaintAttachment
        fields = ['id', 'filename', 'file', 'file_size', 'uploaded_by', 'uploaded_at']
        read_only_fields = ['uploaded_by', 'uploaded_at', 'file_size']

class ComplaintUpdateSerializer(serializers.ModelSerializer):
    updated_by = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = ComplaintUpdate
        fields = ['id', 'update_type', 'message', 'old_status', 'new_status', 
                 'updated_by', 'created_at']
        read_only_fields = ['updated_by', 'created_at']

class ComplaintListSerializer(serializers.ModelSerializer):
    """Serializer for listing complaints (minimal data)"""
    submitted_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    time_since_created = serializers.SerializerMethodField()
    
    class Meta:
        model = Complaint
        fields = ['id', 'title', 'category', 'priority', 'status', 'location',
                 'submitted_by', 'assigned_to', 'created_at', 'updated_at', 
                 'time_since_created']
    
    def get_time_since_created(self, obj):
        delta = timezone.now() - obj.created_at
        days = delta.days
        hours = delta.seconds // 3600
        
        if days > 0:
            return f"{days} day{'s' if days > 1 else ''} ago"
        elif hours > 0:
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        else:
            minutes = delta.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"

class ComplaintDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed complaint view"""
    submitted_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    updates = ComplaintUpdateSerializer(many=True, read_only=True)
    attachments = ComplaintAttachmentSerializer(many=True, read_only=True)
    time_since_created = serializers.SerializerMethodField()
    time_to_resolution = serializers.SerializerMethodField()
    
    class Meta:
        model = Complaint
        fields = ['id', 'title', 'description', 'category', 'priority', 'status',
                 'location', 'contact_info', 'submitted_by', 'assigned_to',
                 'created_at', 'updated_at', 'assigned_at', 'resolved_at',
                 'resolution_notes', 'admin_notes', 'updates', 'attachments',
                 'time_since_created', 'time_to_resolution', 'offline_id']
    
    def get_time_since_created(self, obj):
        delta = timezone.now() - obj.created_at
        days = delta.days
        hours = delta.seconds // 3600
        
        if days > 0:
            return f"{days} day{'s' if days > 1 else ''} ago"
        elif hours > 0:
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        else:
            minutes = delta.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    
    def get_time_to_resolution(self, obj):
        if obj.resolved_at:
            delta = obj.resolved_at - obj.created_at
            days = delta.days
            hours = delta.seconds // 3600
            
            if days > 0:
                return f"{days} day{'s' if days > 1 else ''}"
            elif hours > 0:
                return f"{hours} hour{'s' if hours > 1 else ''}"
            else:
                minutes = delta.seconds // 60
                return f"{minutes} minute{'s' if minutes > 1 else ''}"
        return None

class ComplaintCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new complaints"""
    
    class Meta:
        model = Complaint
        fields = ['title', 'description', 'category', 'priority', 'location', 
                 'contact_info', 'offline_id']
    
    def create(self, validated_data):
        # Set the submitted_by field to the current user
        validated_data['submitted_by'] = self.context['request'].user
        return super().create(validated_data)

class ComplaintUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating complaint status, assignment, etc."""
    
    class Meta:
        model = Complaint
        fields = ['status', 'assigned_to', 'resolution_notes', 'admin_notes', 'priority']
    
    def update(self, instance, validated_data):
        # Track status changes
        old_status = instance.status
        new_status = validated_data.get('status', instance.status)
        
        # Track assignment changes
        old_assigned = instance.assigned_to
        new_assigned = validated_data.get('assigned_to', instance.assigned_to)
        
        # Update the instance
        instance = super().update(instance, validated_data)
        
        # Create update records for tracking
        request_user = self.context['request'].user
        
        # Log status change
        if old_status != new_status:
            ComplaintUpdate.objects.create(
                complaint=instance,
                updated_by=request_user,
                update_type='status_change',
                message=f"Status changed from {old_status} to {new_status}",
                old_status=old_status,
                new_status=new_status
            )
        
        # Log assignment change
        if old_assigned != new_assigned:
            if new_assigned:
                message = f"Assigned to {new_assigned.get_full_name()}"
            else:
                message = "Assignment removed"
            
            ComplaintUpdate.objects.create(
                complaint=instance,
                updated_by=request_user,
                update_type='assignment',
                message=message
            )
        
        # Log resolution
        if new_status == 'resolved' and old_status != 'resolved':
            ComplaintUpdate.objects.create(
                complaint=instance,
                updated_by=request_user,
                update_type='resolution',
                message="Complaint marked as resolved"
            )
        
        return instance

class ComplaintStatsSerializer(serializers.Serializer):
    """Serializer for complaint statistics dashboard"""
    total_complaints = serializers.IntegerField()
    pending_complaints = serializers.IntegerField()
    assigned_complaints = serializers.IntegerField()
    resolved_complaints = serializers.IntegerField()
    high_priority_complaints = serializers.IntegerField()
    my_complaints = serializers.IntegerField()
    avg_resolution_time = serializers.CharField()

class BulkSyncSerializer(serializers.Serializer):
    """Serializer for syncing offline complaints"""
    complaints = ComplaintCreateSerializer(many=True)
    
    def create(self, validated_data):
        complaints_data = validated_data['complaints']
        created_complaints = []
        
        for complaint_data in complaints_data:
            # Check if offline complaint already exists
            offline_id = complaint_data.get('offline_id')
            if offline_id and Complaint.objects.filter(offline_id=offline_id).exists():
                continue  # Skip if already synced
            
            complaint_data['submitted_by'] = self.context['request'].user
            complaint_data['is_synced'] = True
            complaint = Complaint.objects.create(**complaint_data)
            created_complaints.append(complaint)
        
        return {'complaints': created_complaints}