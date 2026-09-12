import pytest
from django.core.cache import cache
from django.urls import reverse
from rest_framework import status

from leads.models import ContactSubmission

pytestmark = pytest.mark.django_db

VALID_PAYLOAD = {
    'name': 'Priya Sharma',
    'email': 'priya@example.com',
    'phone': '+919999999999',
    'service': 'Wedding Photography',
    'date': None,
    'message': 'Looking to book a session.',
}


@pytest.fixture(autouse=True)
def clear_throttle_cache():
    """The contact endpoint is rate-limited (10/hour); reset it around every test to avoid bleed-through."""
    cache.clear()
    yield
    cache.clear()


class TestContactSubmissionCreate:
    """The public booking form: anyone can submit, nothing else is exposed."""

    def test_anonymous_can_submit(self, api_client):
        response = api_client.post(reverse('contact-list'), VALID_PAYLOAD, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert ContactSubmission.objects.count() == 1

    def test_missing_required_field_returns_400(self, api_client):
        payload = {**VALID_PAYLOAD}
        del payload['phone']
        response = api_client.post(reverse('contact-list'), payload, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'phone' in response.data

    def test_blank_date_is_accepted_as_null(self, api_client):
        response = api_client.post(reverse('contact-list'), {**VALID_PAYLOAD, 'date': None}, format='json')
        assert response.status_code == status.HTTP_201_CREATED

    def test_create_response_excludes_admin_only_fields(self, api_client):
        response = api_client.post(reverse('contact-list'), VALID_PAYLOAD, format='json')
        assert 'id' not in response.data
        assert 'is_read' not in response.data
        assert 'created_at' not in response.data


class TestContactSubmissionManagement:
    """Everything except create is staff-only — these are customers' contact details."""

    def test_anonymous_cannot_list(self, api_client):
        response = api_client.get(reverse('contact-list'))
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_admin_can_list(self, admin_api_client):
        ContactSubmission.objects.create(name='A', phone='1', service='X')
        response = admin_api_client.get(reverse('contact-list'))
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

    def test_anonymous_cannot_retrieve(self, api_client):
        lead = ContactSubmission.objects.create(name='A', phone='1', service='X')
        response = api_client.get(reverse('contact-detail', args=[lead.pk]))
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_admin_can_retrieve(self, admin_api_client):
        lead = ContactSubmission.objects.create(name='A', phone='1', service='X')
        response = admin_api_client.get(reverse('contact-detail', args=[lead.pk]))
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == 'A'

    def test_anonymous_cannot_update(self, api_client):
        lead = ContactSubmission.objects.create(name='A', phone='1', service='X')
        response = api_client.patch(reverse('contact-detail', args=[lead.pk]), {'is_read': True}, format='json')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_admin_can_mark_as_read(self, admin_api_client):
        lead = ContactSubmission.objects.create(name='A', phone='1', service='X')
        response = admin_api_client.patch(reverse('contact-detail', args=[lead.pk]), {'is_read': True}, format='json')
        assert response.status_code == status.HTTP_200_OK
        lead.refresh_from_db()
        assert lead.is_read is True

    def test_anonymous_cannot_delete(self, api_client):
        lead = ContactSubmission.objects.create(name='A', phone='1', service='X')
        response = api_client.delete(reverse('contact-detail', args=[lead.pk]))
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert ContactSubmission.objects.filter(pk=lead.pk).exists()

    def test_admin_can_delete(self, admin_api_client):
        lead = ContactSubmission.objects.create(name='A', phone='1', service='X')
        response = admin_api_client.delete(reverse('contact-detail', args=[lead.pk]))
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not ContactSubmission.objects.filter(pk=lead.pk).exists()


class TestContactSubmissionThrottle:
    def test_more_than_ten_submissions_per_hour_are_throttled(self, api_client):
        for _ in range(10):
            response = api_client.post(reverse('contact-list'), VALID_PAYLOAD, format='json')
            assert response.status_code == status.HTTP_201_CREATED

        response = api_client.post(reverse('contact-list'), VALID_PAYLOAD, format='json')
        assert response.status_code == status.HTTP_429_TOO_MANY_REQUESTS
