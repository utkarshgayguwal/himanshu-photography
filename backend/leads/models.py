from django.db import models


class ContactSubmission(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30)
    service = models.CharField(max_length=150)
    date = models.DateField(null=True, blank=True)
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} ({self.service}) — {self.created_at:%Y-%m-%d}'
