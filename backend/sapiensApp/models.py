from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _
from django.db import models
from sentence_transformers import SentenceTransformer, util


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
    email = models.EmailField(_('email address'), unique=True, null=False)
    bio = models.TextField(null=True, blank=True)
    avatar = models.ImageField(null=True, default="profile_pic.png", blank=True)
    social = models.CharField(max_length=300, null=True, blank=True)
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
    topic = models.ManyToManyField(Topic)
    name = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    content = models.TextField()
    participants = models.ManyToManyField(
        User, related_name='participants', blank=True)
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)
    score = models.IntegerField(default=0)
    source = models.URLField(null=True, blank=True)
    public = models.BooleanField(default=True)

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
    resolved = models.BooleanField(default=False) 

    def __str__(self):
        return f"Report on list {self.list} at {self.timestamp}"
    

class Feedback(models.Model):
    feedback = models.TextField()
    resolved = models.BooleanField(default=False) 

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
    

class Notification(models.Model):
    message = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    creator = models.CharField(max_length=255)
    receiver = models.CharField(max_length=255)
    read = models.BooleanField(default=False)  # Default to unread
    url = models.CharField(max_length=255)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return self.message
    

class RevokedToken(models.Model):
    token = models.CharField(max_length=500, unique=True)
    expiration_date = models.DateTimeField()

    def __str__(self):
        return str(self.expiration_date)


class RankTopic(models.Model):
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name


class Rank(models.Model):
    topic = models.ManyToManyField(RankTopic)
    name = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    content = models.JSONField(default=dict)
    contributors = models.ManyToManyField(
        User, related_name='contributors', blank=True)
    score = models.IntegerField(default=0)
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)
    # New field for storing BERT embeddings
    embeddings = models.JSONField(null=True, blank=True)

    @staticmethod
    def calculate_similarity(embeddings1, embeddings2):
        # Calculate cosine similarity between embeddings
        return util.pytorch_cos_sim(embeddings1, embeddings2).item()

    
    def calculate_and_save_embeddings(self):
        model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
        # Calculate embeddings using BERT model
        embeddings = model.encode(f'{self.name} {self.description}')

        self.embeddings = embeddings.tolist()
        # self.save()

    def is_similar_to(self, other_rank):
        # TODO: Decide how to hardcode this threshold
        similarity_threshold = 0.8

        # Check and recalculate embeddings if they are None
        if self.embeddings is None:
            self.calculate_and_save_embeddings()
        if other_rank.embeddings is None:
            other_rank.calculate_and_save_embeddings()

        similarity = Rank.calculate_similarity(self.embeddings, other_rank.embeddings)
        return similarity > similarity_threshold

    @staticmethod
    def get_similar_ranks(new_rank):
        similar_ranks = [
            rank for rank in Rank.objects.exclude(id=new_rank.id)
            if rank.embeddings and rank.is_similar_to(new_rank)
        ][:5]
        return similar_ranks

    class Meta:
        ordering = ['-updated', '-created']

    def __str__(self):
        return self.name
    

class RankVote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rank = models.ForeignKey(Rank, on_delete=models.CASCADE)
    content_index = models.CharField() 
    action = models.CharField(default='neutral', max_length=15) 

    def __str__(self):
        return f"{self.user} voted for {self.action} on element {self.content_index}"


class RankSaved(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rank = models.ForeignKey(Rank, on_delete=models.CASCADE)
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-saved_at']

    def __str__(self):
        return f"{self.user.name} saved {self.rank.name}"
    

class RankReport(models.Model):
    rank = models.ForeignKey(Rank, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    reason = models.TextField()
    resolved = models.BooleanField(default=False) 

    def __str__(self):
        return f"Report on rank {self.rank} at {self.timestamp}"