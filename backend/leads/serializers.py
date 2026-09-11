from rest_framework import serializers

from .models import ContactSubmission


class ContactSubmissionSerializer(serializers.ModelSerializer):
    """Public-facing: what the booking form is allowed to submit."""

    class Meta:
        model = ContactSubmission
        fields = ['name', 'email', 'phone', 'service', 'date', 'message']


class ContactSubmissionAdminSerializer(serializers.ModelSerializer):
    """Staff-facing: full record, including the read/unread flag they manage."""

    class Meta:
        model = ContactSubmission
        fields = ['id', 'name', 'email', 'phone', 'service', 'date', 'message', 'created_at', 'is_read']
        read_only_fields = ['created_at']
