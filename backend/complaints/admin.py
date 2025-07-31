from django.contrib import admin
from .models import Complaint

@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    # Replace 'user' with the actual field name from your model
    list_display = ['title', 'submitted_by', 'status', 'created_at']  # Example: using 'complainant'
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'description']