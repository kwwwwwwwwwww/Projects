from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractUser

class Sentiment(models.Model):
    Sentence = models.CharField(max_length=120)

    
class TwitterCommentHistory(models.Model):
    username = models.CharField(max_length=255)
    url = models.URLField()
    timestamp = models.DateTimeField(auto_now_add=True)
    results = models.TextField(default={})


class TwitterHashtagHistory(models.Model):
    username = models.CharField(max_length=255)
    hashtag = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    results = models.TextField(default={})


class TwitterTrendHistory(models.Model):
    username = models.CharField(max_length=255)
    trend = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    results = models.TextField(default={})


class InstagramHistory(models.Model):
    username = models.CharField(max_length=255)
    url = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    results = models.TextField(default={})


class FacebookHistory(models.Model):
    username = models.CharField(max_length=255)
    url = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    results = models.TextField(default={})

class UserActivity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    username = models.CharField(max_length=150, default='unknown_user')  # Add this line
    action = models.CharField(max_length=10)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} {self.action} at {self.timestamp}"
