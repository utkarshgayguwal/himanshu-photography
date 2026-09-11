from rest_framework.routers import SimpleRouter

from . import views

router = SimpleRouter(trailing_slash=True)
router.register('contact', views.ContactSubmissionViewSet, basename='contact')

urlpatterns = router.urls
