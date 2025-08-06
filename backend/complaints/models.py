from django.db import models
from django.conf import settings
from django.core.validators import MinLengthValidator

class Complaint(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    )
    
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    )
    
    CATEGORY_CHOICES = (
        ('network_slow', 'Network Slow'),
        ('network_down', 'Network Down'),
        ('wifi_issues', 'WiFi Issues'),
        ('server_issues', 'Server Issues'),
        ('email_issues', 'Email Issues'),
        ('internet', 'Internet Connectivity'),
        ('other', 'Other'),
    )
    
    title = models.CharField(max_length=200, validators=[MinLengthValidator(5)])
    description = models.TextField(validators=[MinLengthValidator(10)])
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    
    # Relationships
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='submitted_complaints'
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_complaints',
        limit_choices_to={'role': 'engineer'}
    )
    
    location = models.CharField(max_length=100, blank=True, help_text="Building/Room location")
    contact_info = models.CharField(max_length=200, blank=True, help_text="Phone/Email for contact")
    resolution_notes = models.TextField(blank=True)
    admin_notes = models.TextField(blank=True, help_text="Internal admin notes")

    offline_id = models.CharField(max_length=100, blank=True, null=True, unique=True)
    is_synced = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    assigned_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    
    class Meta:
        db_table = 'complaints'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['created_at']),
            models.Index(fields=['assigned_to']),
            models.Index(fields=['offline_id']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"
    
    @property
    def is_overdue(self):
        """Check if complaint is overdue based on priority"""
        from django.utils import timezone
        from datetime import timedelta
        
        if self.status in ['resolved', 'closed']:
            return False
            
        priority_hours = {
            'critical': 2,
            'high': 24,
            'medium': 72,
            'low': 168
        }
        
        hours = priority_hours.get(self.priority, 72)
        deadline = self.created_at + timedelta(hours=hours)
        return timezone.now() > deadline

class ComplaintUpdate(models.Model):
    """Track all updates/changes on a complaint"""
    UPDATE_TYPE_CHOICES = (
        ('status_change', 'Status Change'),
        ('assignment', 'Assignment'),
        ('priority_change', 'Priority Change'),
        ('comment', 'Comment'),
        ('resolution', 'Resolution'),
        ('creation', 'Creation'),
    )
    
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='updates')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    update_type = models.CharField(max_length=20, choices=UPDATE_TYPE_CHOICES)
    message = models.TextField()
    old_status = models.CharField(max_length=15, blank=True)
    new_status = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'complaint_updates'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.complaint.title} - {self.get_update_type_display()}"

class ComplaintAttachment(models.Model):
    """File attachments for complaints"""
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='attachments')
    filename = models.CharField(max_length=255)
    file = models.FileField(upload_to='complaint_attachments/')
    file_size = models.IntegerField(help_text="File size in bytes")
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'complaint_attachments'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.filename} - {self.complaint.title}"
    
    def save(self, *args, **kwargs):
        if self.file and not self.file_size:
            self.file_size = self.file.size
        super().save(*args, **kwargs)



class ComplaintActivity(models.Model):
    """Track all activities/changes on a complaint"""
    ACTION_CHOICES = (
        ('created', 'Created'),
        ('assigned', 'Assigned'),
        ('status_changed', 'Status Changed'),
        ('priority_changed', 'Priority Changed'),
        ('comment_added', 'Comment Added'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    )
    
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='activities')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    description = models.TextField()
    old_value = models.CharField(max_length=100, blank=True)
    new_value = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'complaint_activities'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.complaint.title} - {self.get_action_display()}"

class ComplaintComment(models.Model):
    """Comments on complaints"""
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    comment = models.TextField()
    is_internal = models.BooleanField(default=False)  # Internal comments only visible to staff
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'complaint_comments'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment on {self.complaint.title} by {self.user.full_name}"
