from django.urls import path

from . import views

urlpatterns = [
    path('services/', views.ServiceListView.as_view(), name='service-list'),
    path('portfolio/', views.PortfolioImageListView.as_view(), name='portfolio-list'),
    path('testimonials/', views.TestimonialListView.as_view(), name='testimonial-list'),
    path('stats/', views.StatListView.as_view(), name='stat-list'),
    path('philosophy/', views.PhilosophyValueListView.as_view(), name='philosophy-list'),
    path('achievements/', views.AchievementListView.as_view(), name='achievement-list'),
    path('about/', views.AboutContentView.as_view(), name='about-content'),
    path('settings/', views.SiteSettingsView.as_view(), name='site-settings'),
]
