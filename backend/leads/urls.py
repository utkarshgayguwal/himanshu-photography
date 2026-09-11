from django.urls import path

from . import views

urlpatterns = [
    path('contact/', views.ContactSubmissionCreateView.as_view(), name='contact-create'),
]
