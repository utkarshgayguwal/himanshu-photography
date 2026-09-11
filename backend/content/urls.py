from django.urls import path
from rest_framework.routers import SimpleRouter

from . import views

router = SimpleRouter(trailing_slash=True)
router.register('services', views.ServiceViewSet, basename='service')
router.register('portfolio', views.PortfolioImageViewSet, basename='portfolio')
router.register('testimonials', views.TestimonialViewSet, basename='testimonial')
router.register('stats', views.StatViewSet, basename='stat')
router.register('philosophy', views.PhilosophyValueViewSet, basename='philosophy')
router.register('achievements', views.AchievementViewSet, basename='achievement')

urlpatterns = router.urls + [
    path('about/', views.AboutContentView.as_view(), name='about-content'),
    path('settings/', views.SiteSettingsView.as_view(), name='site-settings'),
]
