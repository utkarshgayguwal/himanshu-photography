from rest_framework.generics import ListAPIView, RetrieveAPIView

from .models import (
    AboutContent,
    Achievement,
    PhilosophyValue,
    PortfolioImage,
    Service,
    SiteSettings,
    Stat,
    Testimonial,
)
from .serializers import (
    AboutContentSerializer,
    AchievementSerializer,
    PhilosophyValueSerializer,
    PortfolioImageSerializer,
    ServiceSerializer,
    SiteSettingsSerializer,
    StatSerializer,
    TestimonialSerializer,
)


class ServiceListView(ListAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer


class PortfolioImageListView(ListAPIView):
    queryset = PortfolioImage.objects.all()
    serializer_class = PortfolioImageSerializer


class TestimonialListView(ListAPIView):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer


class StatListView(ListAPIView):
    queryset = Stat.objects.all()
    serializer_class = StatSerializer


class PhilosophyValueListView(ListAPIView):
    queryset = PhilosophyValue.objects.all()
    serializer_class = PhilosophyValueSerializer


class AchievementListView(ListAPIView):
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer


class SingletonRetrieveView(RetrieveAPIView):
    """Base for the site's one-row 'settings' style endpoints."""

    model = None

    def get_object(self):
        return self.model.load()


class AboutContentView(SingletonRetrieveView):
    model = AboutContent
    serializer_class = AboutContentSerializer


class SiteSettingsView(SingletonRetrieveView):
    model = SiteSettings
    serializer_class = SiteSettingsSerializer
