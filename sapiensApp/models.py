from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _
from django.db import models

"""Declare models for YOUR_APP app."""

class UserManager(BaseUserManager):
    """Define a model manager for User model with no username field."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """Create and save a User with the given email and password."""
        if not email:
            raise ValueError('Users require an email field')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular User with the given email and password."""
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    """User model."""

    username = None
    name = models.CharField(max_length=200, null=True)
    email = models.EmailField(_('email address'), unique=True, null=True)
    bio = models.TextField(null=True, blank=True)
    avatar = models.ImageField(null=True, default="profile_pic.png", blank=True)
    followers = models.ManyToManyField(
        "self", blank=True, related_name="following", symmetrical=False
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()


class Topic(models.Model):
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name


class List(models.Model):
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    topic = models.ForeignKey(Topic, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=200)
    content = models.TextField(null=True, blank=True)
    participants = models.ManyToManyField(
        User, related_name='participants', blank=True)
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)
    score = models.IntegerField(default=0)
    source = models.CharField(max_length=500, blank=True, default='')

    class Meta:
        ordering = ['-updated', '-created']

    def __str__(self):
        return self.name
    

class EditSuggestion(models.Model):
    list = models.ForeignKey(List, on_delete=models.CASCADE)
    suggested_by = models.ForeignKey(User, on_delete=models.CASCADE)
    suggestion_text = models.TextField()
    is_accepted = models.BooleanField(default=False)

    def __str__(self):
        return f"Edit List {self.list}. Is Accepted? {self.is_accepted}"

class EditComment(models.Model):
    edit_suggestion = models.ForeignKey(EditSuggestion, on_delete=models.CASCADE)
    commenter = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()

    def __str__(self):
        return f"Edit List {self.edit_suggestion.list} comment by {self.commenter}"


class Vote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    list = models.ForeignKey(List, on_delete=models.CASCADE)
    action = models.CharField(default='neutral', max_length=15) 

    def __str__(self):
        return f"{self.user} voted for {self.action}"


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    list = models.ForeignKey(List, on_delete=models.CASCADE)
    body = models.TextField()
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created', 'updated']

    def __str__(self):
        return self.body[0:50]
    

class Report(models.Model):
    list = models.ForeignKey(List, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    reason = models.TextField()

    def __str__(self):
        return f"Report on list {self.list} at {self.timestamp}"
    

class Feedback(models.Model):
    feedback = models.TextField()

    def __str__(self):
        return self.feedback[0:50]
    

class SavedList(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    list = models.ForeignKey(List, on_delete=models.CASCADE)
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-saved_at']

    def __str__(self):
        return f"{self.user.name} saved {self.list.name}"
