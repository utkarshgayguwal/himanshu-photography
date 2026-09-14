import logging

from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.viewsets import ModelViewSet

from .models import ContactSubmission
from .serializers import ContactSubmissionAdminSerializer, ContactSubmissionSerializer
from .whatsapp import notify_new_lead

logger = logging.getLogger(__name__)


class ContactSubmissionViewSet(ModelViewSet):
    """Anyone can submit (create); only staff can list/view/update/delete leads."""

    queryset = ContactSubmission.objects.all()
    throttle_scope = 'contact'

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]

    def get_serializer_class(self):
        if self.action == 'create':
            return ContactSubmissionSerializer
        return ContactSubmissionAdminSerializer

    def perform_create(self, serializer):
        submission = serializer.save()
        try:
            notify_new_lead(submission)
        except Exception:
            logger.exception('Failed to dispatch WhatsApp notification.')
