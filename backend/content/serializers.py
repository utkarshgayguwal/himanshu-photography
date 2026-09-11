from rest_framework import serializers

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


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'slug', 'title', 'subtitle', 'description', 'image_url', 'includes', 'tag', 'is_featured']


class PortfolioImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioImage
        fields = ['id', 'image_url', 'image_type', 'label', 'aspect', 'is_featured']


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ['id', 'quote', 'name', 'role']


class StatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stat
        fields = ['id', 'number', 'label']


class PhilosophyValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhilosophyValue
        fields = ['id', 'icon', 'title', 'description']


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['id', 'year', 'description']


class AboutContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutContent
        fields = ['hero_bio', 'story_paragraphs', 'pull_quote', 'pull_quote_author']


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            'phone', 'email', 'address', 'map_embed_url',
            'instagram_url', 'facebook_url', 'footer_tagline', 'copyright_text',
        ]
