from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import TwitterCommentHistory, TwitterHashtagHistory, TwitterTrendHistory, InstagramHistory, FacebookHistory

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['is_staff'] = user.is_staff

        return token

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'is_staff']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user

    
class SentenceSerializer(serializers.Serializer):
    sentence = serializers.CharField()


class TwitterCommentHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TwitterCommentHistory
        fields = '__all__'

class TwitterHashtagHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TwitterHashtagHistory
        fields = '__all__'

class TwitterTrendHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TwitterTrendHistory
        fields = '__all__'

class InstagramHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = InstagramHistory
        fields = '__all__'

class FacebookHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FacebookHistory
        fields = '__all__'

class RegisterUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'is_staff']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': False},
            'is_staff': {'required': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', ''),
            is_staff=validated_data['is_staff']
        )
        return user