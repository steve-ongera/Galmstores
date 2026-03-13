## models.py
from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    is_email_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.username