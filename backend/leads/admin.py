from django.contrib import admin

from .models import ContactSubmission


@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'service', 'date', 'created_at', 'is_read')
    list_filter = ('is_read', 'service')
    list_editable = ('is_read',)
    search_fields = ('name', 'email', 'phone', 'message')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)
