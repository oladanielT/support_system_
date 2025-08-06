from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import RegexValidator
from django.utils import timezone

# Custom user manager
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if not extra_fields.get('is_staff'):
            raise ValueError('Superuser must have is_staff=True.')
        if not extra_fields.get('is_superuser'):
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)

    ROLE_CHOICES = [
        ('user', 'User'),
        ('admin', 'Admin'),
        ('engineer', 'Engineer'),
    ]
    DEPARTMENTS = (
        ('computer_science', 'Computer Science'),
        ('engineering', 'Engineering'),
        ('medicine', 'Medicine'),
        ('law', 'Law'),
        ('arts', 'Arts'),
        ('sciences', 'Sciences'),
        ('administration', 'Administration'),
        ('ict', 'ICT Department'),
    )

    department = models.CharField(max_length=50, choices=DEPARTMENTS, default='ict')
    role = models.CharField(max_length=125, choices=ROLE_CHOICES, default='user')
    phone_regex = RegexValidator(
        regex=r'^\+?234?\d{9,15}$',
        message="Phone number must be entered in the format: '+234999999999'. Up to 15 digits allowed."
    )
    phone_number = models.CharField(validators=[phone_regex], max_length=17, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  

    objects = CustomUserManager()
    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def is_admin(self):
        return self.role == 'admin'

    def is_engineer(self):
        return self.role == 'engineer'

    def is_regular_user(self):
        return self.role == 'user'
