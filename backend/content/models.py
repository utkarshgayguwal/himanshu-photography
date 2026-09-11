from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SingletonModel(models.Model):
    """A model that only ever has one row (pk=1), e.g. site-wide settings."""

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class Service(TimeStampedModel):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=200, blank=True)
    description = models.TextField()
    image_url = models.CharField(max_length=500)
    includes = models.JSONField(default=list, blank=True, help_text='List of short inclusion strings')
    tag = models.CharField(max_length=50, blank=True)
    is_featured = models.BooleanField(default=False, help_text='Show in the Home page services preview')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.title


class PortfolioImage(TimeStampedModel):
    IMAGE_TYPE_CHOICES = [('local', 'Local'), ('unsplash', 'Unsplash')]
    ASPECT_CHOICES = [('tall', 'Tall'), ('wide', 'Wide'), ('square', 'Square')]

    image_url = models.CharField(max_length=500)
    image_type = models.CharField(max_length=10, choices=IMAGE_TYPE_CHOICES, default='unsplash')
    label = models.CharField(max_length=100, blank=True)
    aspect = models.CharField(max_length=10, choices=ASPECT_CHOICES, default='square')
    is_featured = models.BooleanField(default=False, help_text='Show in the Home page gallery preview')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.label or self.image_url


class Testimonial(TimeStampedModel):
    quote = models.TextField()
    name = models.CharField(max_length=150)
    role = models.CharField(max_length=150, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.name


class Stat(TimeStampedModel):
    number = models.CharField(max_length=20)
    label = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f'{self.number} {self.label}'


class PhilosophyValue(TimeStampedModel):
    icon = models.CharField(max_length=50, help_text="lucide-react icon name, e.g. 'Heart'")
    title = models.CharField(max_length=100)
    description = models.TextField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']
        verbose_name_plural = 'Philosophy values'

    def __str__(self):
        return self.title


class Achievement(TimeStampedModel):
    year = models.CharField(max_length=10)
    description = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f'{self.year} — {self.description}'


class AboutContent(SingletonModel, TimeStampedModel):
    hero_bio = models.TextField()
    story_paragraphs = models.JSONField(default=list, blank=True)
    pull_quote = models.CharField(max_length=255, blank=True)
    pull_quote_author = models.CharField(max_length=100, blank=True)

    class Meta:
        verbose_name = 'About content'
        verbose_name_plural = 'About content'

    def __str__(self):
        return 'About page content'


class SiteSettings(SingletonModel, TimeStampedModel):
    phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    address = models.CharField(max_length=255, blank=True)
    map_embed_url = models.URLField(max_length=1000, blank=True)
    instagram_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    footer_tagline = models.CharField(max_length=255, blank=True)
    copyright_text = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = 'Site settings'
        verbose_name_plural = 'Site settings'

    def __str__(self):
        return 'Site settings'
