from django.contrib import admin

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


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'subtitle', 'tag', 'is_featured', 'order')
    list_editable = ('is_featured', 'order')
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ('title', 'subtitle', 'description')


@admin.register(PortfolioImage)
class PortfolioImageAdmin(admin.ModelAdmin):
    list_display = ('label', 'image_type', 'aspect', 'is_featured', 'order')
    list_editable = ('is_featured', 'order')
    list_filter = ('image_type', 'aspect', 'is_featured')


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'order')
    list_editable = ('order',)


@admin.register(Stat)
class StatAdmin(admin.ModelAdmin):
    list_display = ('number', 'label', 'order')
    list_editable = ('order',)


@admin.register(PhilosophyValue)
class PhilosophyValueAdmin(admin.ModelAdmin):
    list_display = ('title', 'icon', 'order')
    list_editable = ('order',)


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('year', 'description', 'order')
    list_editable = ('order',)


class SingletonAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return not self.model.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(AboutContent)
class AboutContentAdmin(SingletonAdmin):
    list_display = ('__str__', 'pull_quote_author')


@admin.register(SiteSettings)
class SiteSettingsAdmin(SingletonAdmin):
    list_display = ('__str__', 'phone', 'email')
