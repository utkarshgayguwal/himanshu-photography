import pytest
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
    """Unauthenticated DRF test client."""
    return APIClient()


@pytest.fixture
def admin_api_client(admin_user):
    """DRF test client authenticated as a staff/superuser (`admin_user` is pytest-django's builtin fixture)."""
    client = APIClient()
    client.force_authenticate(user=admin_user)
    return client
