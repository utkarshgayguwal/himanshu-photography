import pytest
from django.urls import reverse
from rest_framework import status

from content.models import Service

pytestmark = pytest.mark.django_db

# (url_name, minimal valid payload) for every list/create content endpoint.
LIST_ENDPOINTS = [
    ('service-list', {'slug': 'x', 'title': 'X', 'description': 'd', 'image_url': 'http://x'}),
    ('portfolio-list', {'image_url': 'http://x/1.jpg'}),
    ('testimonial-list', {'quote': 'Great!', 'name': 'Test'}),
    ('stat-list', {'number': '10+', 'label': 'Test Label'}),
    ('philosophy-list', {'icon': 'Heart', 'title': 'Test', 'description': 'd'}),
    ('achievement-list', {'year': '2025', 'description': 'Test Achievement'}),
]


@pytest.mark.parametrize('url_name,payload', LIST_ENDPOINTS)
class TestContentEndpointPermissions:
    """Every content endpoint: public reads, admin-only writes."""

    def test_anyone_can_list(self, api_client, url_name, payload):
        response = api_client.get(reverse(url_name))
        assert response.status_code == status.HTTP_200_OK

    def test_anonymous_cannot_create(self, api_client, url_name, payload):
        response = api_client.post(reverse(url_name), payload, format='json')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_admin_can_create(self, admin_api_client, url_name, payload):
        response = admin_api_client.post(reverse(url_name), payload, format='json')
        assert response.status_code == status.HTTP_201_CREATED


class TestServiceFullCRUDLifecycle:
    """Deep-dive on one resource to prove retrieve/update/delete work end to end."""

    def test_full_lifecycle(self, admin_api_client, api_client):
        create = admin_api_client.post(
            reverse('service-list'),
            {
                'slug': 'lifecycle', 'title': 'Lifecycle Service', 'description': 'd',
                'image_url': 'http://x', 'includes': ['a', 'b'], 'tag': '', 'order': 1,
            },
            format='json',
        )
        assert create.status_code == status.HTTP_201_CREATED
        pk = create.data['id']

        retrieve = api_client.get(reverse('service-detail', args=[pk]))
        assert retrieve.status_code == status.HTTP_200_OK
        assert retrieve.data['title'] == 'Lifecycle Service'

        anon_update = api_client.patch(reverse('service-detail', args=[pk]), {'title': 'Hacked'}, format='json')
        assert anon_update.status_code == status.HTTP_403_FORBIDDEN

        update = admin_api_client.patch(reverse('service-detail', args=[pk]), {'title': 'Updated'}, format='json')
        assert update.status_code == status.HTTP_200_OK
        assert update.data['title'] == 'Updated'

        anon_delete = api_client.delete(reverse('service-detail', args=[pk]))
        assert anon_delete.status_code == status.HTTP_403_FORBIDDEN
        assert Service.objects.filter(pk=pk).exists()

        delete = admin_api_client.delete(reverse('service-detail', args=[pk]))
        assert delete.status_code == status.HTTP_204_NO_CONTENT
        assert not Service.objects.filter(pk=pk).exists()

    def test_create_requires_unique_slug(self, admin_api_client):
        payload = {'slug': 'dup', 'title': 'A', 'description': 'd', 'image_url': 'http://x'}
        first = admin_api_client.post(reverse('service-list'), payload, format='json')
        assert first.status_code == status.HTTP_201_CREATED

        second = admin_api_client.post(reverse('service-list'), payload, format='json')
        assert second.status_code == status.HTTP_400_BAD_REQUEST
        assert 'slug' in second.data


class TestAboutContentSingletonAPI:
    """GET/PUT/PATCH only — there's exactly one row, so create/delete don't apply."""

    def test_get_creates_and_returns_the_singleton(self, api_client):
        response = api_client.get(reverse('about-content'))
        assert response.status_code == status.HTTP_200_OK
        assert 'hero_bio' in response.data

    def test_anonymous_cannot_update(self, api_client):
        response = api_client.patch(reverse('about-content'), {'pull_quote': 'x'}, format='json')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_admin_can_update(self, admin_api_client):
        response = admin_api_client.patch(reverse('about-content'), {'pull_quote': 'New quote'}, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['pull_quote'] == 'New quote'

    def test_post_is_not_allowed(self, admin_api_client):
        response = admin_api_client.post(reverse('about-content'), {'hero_bio': 'x'}, format='json')
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

    def test_delete_is_not_allowed(self, admin_api_client):
        response = admin_api_client.delete(reverse('about-content'))
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


class TestSiteSettingsSingletonAPI:
    def test_get_returns_the_singleton(self, api_client):
        response = api_client.get(reverse('site-settings'))
        assert response.status_code == status.HTTP_200_OK

    def test_anonymous_cannot_update(self, api_client):
        response = api_client.patch(reverse('site-settings'), {'phone': 'hacked'}, format='json')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_admin_can_update(self, admin_api_client):
        response = admin_api_client.patch(reverse('site-settings'), {'phone': '+911111111111'}, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['phone'] == '+911111111111'

    def test_delete_is_not_allowed(self, admin_api_client):
        response = admin_api_client.delete(reverse('site-settings'))
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
