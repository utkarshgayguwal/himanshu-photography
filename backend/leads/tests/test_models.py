import pytest

from leads.models import ContactSubmission

pytestmark = pytest.mark.django_db


class TestContactSubmission:
    def test_str_format(self):
        submission = ContactSubmission.objects.create(
            name='Priya Sharma', phone='+919999999999', service='Wedding Photography'
        )
        assert str(submission).startswith('Priya Sharma (Wedding Photography)')

    def test_optional_fields_default_sensibly(self):
        submission = ContactSubmission.objects.create(name='Test', phone='123', service='X')
        assert submission.email == ''
        assert submission.date is None
        assert submission.message == ''
        assert submission.is_read is False

    def test_default_ordering_is_newest_first(self):
        first = ContactSubmission.objects.create(name='First', phone='1', service='X')
        second = ContactSubmission.objects.create(name='Second', phone='2', service='X')
        assert list(ContactSubmission.objects.all()) == [second, first]
