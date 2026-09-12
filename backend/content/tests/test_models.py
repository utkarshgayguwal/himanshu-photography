import pytest
from django.db import IntegrityError

from content.models import (
    AboutContent,
    Achievement,
    PhilosophyValue,
    PortfolioImage,
    Service,
    SiteSettings,
    Stat,
)

# Leading underscore: pytest tries to collect a plain `Testimonial` alias as a test class.
from content.models import Testimonial as _Testimonial

pytestmark = pytest.mark.django_db


class TestService:
    def test_str_returns_title(self):
        service = Service.objects.create(
            slug='wedding', title='Wedding Photography', description='d', image_url='http://x'
        )
        assert str(service) == 'Wedding Photography'

    def test_default_ordering_is_by_order_then_id(self):
        second = Service.objects.create(slug='b', title='B', description='d', image_url='http://x', order=2)
        first = Service.objects.create(slug='a', title='A', description='d', image_url='http://x', order=1)
        assert list(Service.objects.all()) == [first, second]

    def test_slug_must_be_unique(self):
        Service.objects.create(slug='dup', title='A', description='d', image_url='http://x')
        with pytest.raises(IntegrityError):
            Service.objects.create(slug='dup', title='B', description='d', image_url='http://x')

    def test_includes_defaults_to_empty_list(self):
        service = Service.objects.create(slug='x', title='X', description='d', image_url='http://x')
        assert service.includes == []


class TestPortfolioImage:
    def test_str_prefers_label(self):
        image = PortfolioImage.objects.create(image_url='http://x/1.jpg', label='Wedding')
        assert str(image) == 'Wedding'

    def test_str_falls_back_to_url_without_a_label(self):
        image = PortfolioImage.objects.create(image_url='http://x/2.jpg')
        assert str(image) == 'http://x/2.jpg'

    def test_defaults(self):
        image = PortfolioImage.objects.create(image_url='http://x/3.jpg')
        assert image.image_type == 'unsplash'
        assert image.aspect == 'square'
        assert image.is_featured is False


class TestTestimonial:
    def test_str_returns_name(self):
        testimonial = _Testimonial.objects.create(quote='Great!', name='Priya Sharma')
        assert str(testimonial) == 'Priya Sharma'


class TestStat:
    def test_str_combines_number_and_label(self):
        stat = Stat.objects.create(number='500+', label='Weddings Captured')
        assert str(stat) == '500+ Weddings Captured'


class TestPhilosophyValue:
    def test_str_returns_title(self):
        value = PhilosophyValue.objects.create(icon='Heart', title='Emotion First', description='d')
        assert str(value) == 'Emotion First'


class TestAchievement:
    def test_str_combines_year_and_description(self):
        achievement = Achievement.objects.create(year='2024', description='Best Wedding Photographer')
        assert str(achievement) == '2024 — Best Wedding Photographer'


class TestAboutContentSingleton:
    def test_load_creates_the_row_on_first_call(self):
        assert AboutContent.objects.count() == 0
        about = AboutContent.load()
        assert AboutContent.objects.count() == 1
        assert about.pk == 1

    def test_load_returns_the_same_row_on_later_calls(self):
        first = AboutContent.load()
        first.hero_bio = 'Updated bio'
        first.save()

        second = AboutContent.load()

        assert second.pk == first.pk
        assert second.hero_bio == 'Updated bio'
        assert AboutContent.objects.count() == 1

    def test_save_always_forces_pk_1(self):
        about = AboutContent(pk=99, hero_bio='x')
        about.save()
        assert about.pk == 1

    def test_delete_is_a_noop(self):
        about = AboutContent.load()
        about.delete()
        assert AboutContent.objects.count() == 1


class TestSiteSettingsSingleton:
    def test_load_creates_the_row_on_first_call(self):
        assert SiteSettings.objects.count() == 0
        settings_obj = SiteSettings.load()
        assert SiteSettings.objects.count() == 1
        assert settings_obj.pk == 1

    def test_save_always_forces_pk_1(self):
        settings_obj = SiteSettings(pk=42, phone='123')
        settings_obj.save()
        assert settings_obj.pk == 1

    def test_delete_is_a_noop(self):
        settings_obj = SiteSettings.load()
        settings_obj.delete()
        assert SiteSettings.objects.count() == 1
