from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PredictSentimentView, PredictEmotionView
from .views import ScrapeHashtagTweetsView, ScrapeTrendsTweetsView, ScrapeTwitterCommentsView, ScrapeInstagramCommentsView, ScrapeFacebookCommentsView
from .views import TwitterCommentHistoryViewSet, TwitterHashtagHistoryViewSet, TwitterTrendHistoryViewSet, InstagramHistoryViewSet, FacebookHistoryViewSet
from .views import get_counts, RecentActivityView
from .views import get_hashtag_history, get_comment_history, get_trend_history, get_instagram_history, get_facebook_history
from .views import UserListView, RegisterUserView, delete_users

router = DefaultRouter()
router.register(r'twitter-comment-history', TwitterCommentHistoryViewSet)
router.register(r'twitter-hashtag-history', TwitterHashtagHistoryViewSet)
router.register(r'twitter-trend-history', TwitterTrendHistoryViewSet)
router.register(r'instagram-history', InstagramHistoryViewSet)
router.register(r'facebook-history', FacebookHistoryViewSet)

urlpatterns = [
    path('predict_sentiment/', PredictSentimentView.as_view(), name='predict_sentiment'),
    path('predict_emotion/', PredictEmotionView.as_view(), name='predict_emotion'),
    path('scrape_hashtag/', ScrapeHashtagTweetsView.as_view(), name='scrape_hashtag'),
    path('scrape_trends/', ScrapeTrendsTweetsView.as_view(), name='scrape_trends'),
    path('scrape_comments/', ScrapeTwitterCommentsView.as_view(), name='scrape_comments'),
    path('scrape_instacomments/', ScrapeInstagramCommentsView.as_view(), name='scrape_instacomments'),
    path('scrape_facebookcomments/', ScrapeFacebookCommentsView.as_view(), name='scrape_facebookcomments'),
    path('get_hashtag_history/', get_hashtag_history, name='get_hashtag_history'),
    path('get_comment_history/', get_comment_history, name='get_comment_history'),
    path('get_trend_history/', get_trend_history, name='get_trend_history'),
    path('get_instagram_history/', get_instagram_history, name='get_instagram_history'),
    path('get_facebook_history/', get_facebook_history, name='get_facebook_history'),
    path('get_counts/', get_counts, name='get_counts'),
    path('recent-activity/', RecentActivityView.as_view(), name='recent_activity'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('register/', RegisterUserView.as_view(), name='register-user'),
    path('delete_users/', delete_users, name='delete-users'),
    path('', include(router.urls)), 
]