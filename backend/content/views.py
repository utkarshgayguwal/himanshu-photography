from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.viewsets import ModelViewSet

from config.permissions import IsAdminOrReadOnly

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


class ServiceViewSet(ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAdminOrReadOnly]


class PortfolioImageViewSet(ModelViewSet):
    queryset = PortfolioImage.objects.all()
    serializer_class = PortfolioImageSerializer
    permission_classes = [IsAdminOrReadOnly]


class TestimonialViewSet(ModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    permission_classes = [IsAdminOrReadOnly]


class StatViewSet(ModelViewSet):
    queryset = Stat.objects.all()
    serializer_class = StatSerializer
    permission_classes = [IsAdminOrReadOnly]


class PhilosophyValueViewSet(ModelViewSet):
    queryset = PhilosophyValue.objects.all()
    serializer_class = PhilosophyValueSerializer
    permission_classes = [IsAdminOrReadOnly]


class AchievementViewSet(ModelViewSet):
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    permission_classes = [IsAdminOrReadOnly]


class SingletonRetrieveUpdateView(RetrieveUpdateAPIView):
    """Base for the site's one-row 'settings' style resources.

    There's only ever one row (created on first access via `.load()`), so
    "full CRUD" here means read + update — creating a second row or
    deleting the only one wouldn't make sense.
    """

    model = None
    permission_classes = [IsAdminOrReadOnly]

    def get_object(self):
        return self.model.load()


class AboutContentView(SingletonRetrieveUpdateView):
    model = AboutContent
    serializer_class = AboutContentSerializer


class SiteSettingsView(SingletonRetrieveUpdateView):
    model = SiteSettings
    serializer_class = SiteSettingsSerializer
