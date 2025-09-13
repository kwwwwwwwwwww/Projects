import json
import logging
import time
from langdetect import detect, LangDetectException
from time import sleep
from predict_sentiment import predict
from selenium import webdriver
from selenium.webdriver import ChromeOptions, Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from rest_framework.views import APIView
from rest_framework import status, generics, permissions, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import generics
from rest_framework_simplejwt.views import TokenObtainPairView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views import View
from .models import User
from .serializers import UserSerializer
from .serializers import MyTokenObtainPairSerializer
from .models import TwitterCommentHistory, TwitterHashtagHistory, TwitterTrendHistory, InstagramHistory, FacebookHistory, UserActivity
from .serializers import TwitterCommentHistorySerializer, TwitterHashtagHistorySerializer, TwitterTrendHistorySerializer, InstagramHistorySerializer, FacebookHistorySerializer, RegisterUserSerializer
from predict_sentiment import predict
from predict_emotion import predictEmotion


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

logger = logging.getLogger(__name__)

class UserListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get(self, request, *args, **kwargs):
        logger.info(f"Authorization Header: {request.headers.get('Authorization')}")
        users = self.get_queryset()
        usernames = users.values_list('username', flat=True)
        return Response(usernames)

class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterUserSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]


@api_view(['DELETE'])
@permission_classes([permissions.IsAdminUser])
def delete_users(request):
    user_list = request.data.get('users', [])
    if not user_list:
        return Response({"detail": "No users provided for deletion."}, status=status.HTTP_400_BAD_REQUEST)

    users_to_delete = User.objects.filter(username__in=user_list)
    users_to_delete.delete()
    return Response({"detail": "Users deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


@api_view(['DELETE'])
@permission_classes([permissions.IsAdminUser])
def delete_history(request):
    ids = request.data.get('ids', [])
    if not ids:
        return Response({"detail": "No ids provided for deletion."}, status=status.HTTP_400_BAD_REQUEST)

    TwitterCommentHistory.objects.filter(id__in=ids).delete()
    TwitterHashtagHistory.objects.filter(id__in=ids).delete()
    TwitterTrendHistory.objects.filter(id__in=ids).delete()
    InstagramHistory.objects.filter(id__in=ids).delete()
    FacebookHistory.objects.filter(id__in=ids).delete()
    return Response({"detail": "Selected history items deleted successfully."}, status=status.HTTP_204_NO_CONTENT)



@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def get_counts(request):
    user_count = User.objects.count()
    comment_count = TwitterCommentHistory.objects.count()
    hashtag_count = TwitterHashtagHistory.objects.count()
    trend_count = TwitterTrendHistory.objects.count()
    instagram_count = InstagramHistory.objects.count()
    facebook_count = FacebookHistory.objects.count()
    return Response({
        'user_count': user_count,
        'comment_count': comment_count,
        'hashtag_count': hashtag_count,
        'trend_count': trend_count,
        'instagram_count' : instagram_count,
        'facebook_count' : facebook_count
    })


@method_decorator(csrf_exempt, name='dispatch')
class RecentActivityView(View):

    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        username = data.get('username')
        action = data.get('action')
        try:
            user = User.objects.get(username=username)
            UserActivity.objects.create(user=user, username=username, action=action)  # Add username here
            return JsonResponse({'status': 'success'}, status=201)
        except User.DoesNotExist:
            return JsonResponse({'status': 'user not found'}, status=404)

    def get(self, request, *args, **kwargs):
        activities = UserActivity.objects.all().order_by('-timestamp')
        data = [
            {
                'user': activity.username,  
                'action': activity.action,
                'timestamp': activity.timestamp
            }
            for activity in activities
        ]
        return JsonResponse(data, safe=False)


@method_decorator(csrf_exempt, name='dispatch')
class PredictSentimentView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            text = data.get('text', '')
            if not text:
                return JsonResponse({'error': 'No text provided'}, status=400)

            result = predict(text)
            return JsonResponse(result, safe=False, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except KeyError:
            return JsonResponse({'error': 'Missing necessary parameter: text'}, status=400)
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=500)

    def get(self, request):
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=400)
    

@method_decorator(csrf_exempt, name='dispatch')
class PredictEmotionView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            text = data.get('text', '')
            if not text:
                return JsonResponse({'error': 'No text provided'}, status=400)

            result = predictEmotion(text)
            return JsonResponse(result, safe=False, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except KeyError:
            return JsonResponse({'error': 'Missing necessary parameter: text'}, status=400)
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=500)

    def get(self, request):
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=400)
    

def login_to_twitter(driver):
    url = "https://twitter.com/i/flow/login"
    driver.get(url)

    username = WebDriverWait(driver, 20).until(EC.visibility_of_element_located((By.CSS_SELECTOR, 'input[autocomplete="username"]')))
    username.send_keys("testFYP25")
    username.send_keys(Keys.ENTER)

    password = WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.CSS_SELECTOR, 'input[name="password"]')))
    password.send_keys("testingFYPaccount")
    password.send_keys(Keys.ENTER)


def login_to_twitter1(driver):

    username = WebDriverWait(driver, 20).until(EC.visibility_of_element_located((By.CSS_SELECTOR, 'input[autocomplete="username"]')))
    username.send_keys("testFYP25")
    username.send_keys(Keys.ENTER)

    password = WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.CSS_SELECTOR, 'input[name="password"]')))
    password.send_keys("testingFYPaccount")
    password.send_keys(Keys.ENTER)
    
    

@method_decorator(csrf_exempt, name='dispatch')
class ScrapeHashtagTweetsView(APIView):
    def post(self, request):
        try:
            data = json.loads(request.body)
            hashtag = data.get('hashtag', '')
            if not hashtag:
                return JsonResponse({'error': 'No hashtag provided'}, status=400)
            
            options = webdriver.ChromeOptions()
            options.add_argument("--headless")
            options.add_argument("--disable-gpu")
            options.add_argument("--window-size=1920,1080")
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
            driver = webdriver.Chrome(options=options)
            
            try:
                driver.get(f"https://twitter.com/search?q=%23{hashtag}&src=trend_click&vertical=trends")
                login_to_twitter1(driver)
                sleep(5)

                wait = WebDriverWait(driver, 40)
                top_tab = wait.until(EC.element_to_be_clickable((By.XPATH, '//span[text()="Top"]/ancestor::a')))
                top_tab.click()
                sleep(3)

                english_tweets = []
                last_height = driver.execute_script("return document.body.scrollHeight")

                while len(english_tweets) < 10:
                    tweets = driver.find_elements(By.XPATH, '//article[@data-testid="tweet"]')
                    for tweet in tweets:
                        try:
                            tweet_text_element = tweet.find_element(By.XPATH, './/div[@data-testid="tweetText"]')
                            tweet_text = tweet_text_element.text
                            username = tweet.find_element(By.XPATH, './/div[@dir="ltr"]//span').text
                            if detect(tweet_text) == 'en' and (username, tweet_text) not in english_tweets:
                                sentiment = predict(tweet_text)
                                english_tweets.append({
                                    'username': username,
                                    'tweet': tweet_text,
                                    'sentiment': sentiment['label'],
                                    'score': sentiment['score']
                                })
                                if len(english_tweets) == 10:
                                    break
                        except Exception as e:
                            print(f"Error processing tweet: {e}")
                            continue

                    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                    sleep(2)
                    new_height = driver.execute_script("return document.body.scrollHeight")
                    if new_height == last_height:
                        break
                    last_height = new_height

                return JsonResponse(english_tweets, safe=False)

            finally:
                driver.quit()

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except KeyError:
            return JsonResponse({'error': 'Missing necessary parameter: hashtag'}, status=400)
        except Exception as e:
            print(f"Unexpected error: {e}")
            return JsonResponse({'message': str(e)}, status=500)

    def get(self, request):
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class ScrapeTrendsTweetsView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)  
            trend = data.get('trend', '')  
            if not trend:
                return JsonResponse({'error': 'No trend provided'}, status=400)
            
            options = webdriver.ChromeOptions()
            options.add_argument("--headless")
            options.add_argument("--disable-gpu")
            options.add_argument("--window-size=1920,1080")
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
            driver = webdriver.Chrome(options=options)

            try:
                driver.get(f"https://twitter.com/search?q={trend}&src=trend_click&vertical=trends")
                login_to_twitter1(driver)
                sleep(5)

                wait = WebDriverWait(driver, 40)
                top_tab = wait.until(EC.element_to_be_clickable((By.XPATH, '//span[text()="Top"]/ancestor::a')))
                top_tab.click()
                sleep(3)

                english_tweets = []
                last_height = driver.execute_script("return document.body.scrollHeight")

                while len(english_tweets) < 10:
                    tweets = driver.find_elements(By.XPATH, '//article[@data-testid="tweet"]')
                    for tweet in tweets:
                        try:
                            tweet_text_element = tweet.find_element(By.XPATH, './/div[@data-testid="tweetText"]')
                            tweet_text = tweet_text_element.text
                            username = tweet.find_element(By.XPATH, './/div[@dir="ltr"]//span').text
                            if detect(tweet_text) == 'en' and (username, tweet_text) not in english_tweets:
                                sentiment = predict(tweet_text)
                                english_tweets.append({
                                    'username': username,
                                    'tweet': tweet_text,
                                    'sentiment': sentiment['label'],
                                    'score': sentiment['score']
                                })
                                if len(english_tweets) == 10:
                                    break
                        except Exception as e:
                            print(f"Error processing tweet: {e}")
                            continue

                    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                    sleep(2)
                    new_height = driver.execute_script("return document.body.scrollHeight")
                    if new_height == last_height:
                        break
                    last_height = new_height

                return JsonResponse(english_tweets, safe=False)

            finally:
                driver.quit()

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except KeyError:
            return JsonResponse({'error': 'Missing necessary parameter: trend'}, status=400)
        except Exception as e:
            print(f"Unexpected error: {e}")
            return JsonResponse({'message': str(e)}, status=500)

    def get(self, request):
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=400)
    

@method_decorator(csrf_exempt, name='dispatch')
class ScrapeTwitterCommentsView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = json.loads(request.body)
        url_to_scrape = data.get('url')

        if not url_to_scrape:
            return Response({'error': 'No URL provided'}, status=status.HTTP_400_BAD_REQUEST)

        options = ChromeOptions()
        options.add_argument("--start-maximized")
        options.add_argument("--headless")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_argument("--log-level=3")
        options.add_argument('--ignore-certificate-errors')
        options.add_argument('--ignore-ssl-errors')

        driver = webdriver.Chrome(options=options)
        login_to_twitter(driver)
        time.sleep(10)

        driver.get(url_to_scrape)
        time.sleep(10)

        tweets = []
        comment_count = 0
        last_height = driver.execute_script("return document.body.scrollHeight")

        def is_english(text):
            try:
                return detect(text) == 'en'
            except LangDetectException:
                return False

        while comment_count < 10:
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(6)
            new_height = driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height

            all_tweets = driver.find_elements(By.XPATH, '//div[@data-testid]//article[@data-testid="tweet"]')
            for item in all_tweets[1:]:
                if comment_count >= 10:
                    break

                try:
                    username = item.find_element(By.XPATH, './/div[@dir="ltr"]//span').text
                except:
                    username = '[empty]'

                try:
                    date = item.find_element(By.XPATH, './/time').text
                except:
                    date = '[empty]'

                try:
                    text = item.find_element(By.XPATH, './/div[@data-testid="tweetText"]').text
                except:
                    text = '[empty]'

                if is_english(text):
                    tweets.append({'username': username, 'text': text, 'date': date})
                    comment_count += 1

        driver.quit()

        return Response(tweets, status=status.HTTP_200_OK)
    

@method_decorator(csrf_exempt, name='dispatch')
class ScrapeInstagramCommentsView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            post_url = data.get('post_url')

            if not post_url:
                return JsonResponse({'error': 'No URL provided'}, status=400)

            options = ChromeOptions()
            options.add_argument("--start-maximized")
            options.add_experimental_option("excludeSwitches", ["enable-automation"])
            options.add_argument("--headless")

            driver = webdriver.Chrome(options=options)

            try:
                driver.get(post_url)

                time.sleep(4)

                user_names = []
                user_comments = []
                processed_comments = set()

                def extract_comments(elements):
                    for element in elements:
                        try:
                            name = element.find_element(By.CLASS_NAME, '_a9zc').text
                            content = element.find_element(By.TAG_NAME, 'span').text
                            content = content.replace('\n', ' ').strip().rstrip()
                            comment_id = name + content  
                            if comment_id not in processed_comments:
                                try:
                                    if detect(content) == 'en':
                                        user_names.append(name)
                                        user_comments.append(content)
                                        processed_comments.add(comment_id)
                                except LangDetectException:
                                    print(f"Error detecting language for comment: {content}")
                        except Exception as e:
                            print(f"Error extracting comment: {e}")

                comments = driver.find_elements(By.CLASS_NAME, '_a9zr')
                extract_comments(comments)

                view_replies_buttons = driver.find_elements(By.CLASS_NAME, '_a9yi')
                for button in view_replies_buttons:
                    try:
                        driver.execute_script("arguments[0].click();", button)
                        time.sleep(2)  
                    except Exception as e:
                        print(f"Error clicking view replies button: {e}")

                comments = driver.find_elements(By.CLASS_NAME, '_a9zr')
                extract_comments(comments)

                driver.close()

                comments_data = [{'username': name, 'comment': comment} for name, comment in zip(user_names, user_comments)]

                return JsonResponse(comments_data, safe=False, status=200)
            
            finally:
                driver.quit()

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=500)

    def get(self, request):
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=400)
    

@method_decorator(csrf_exempt, name='dispatch')
class ScrapeFacebookCommentsView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            data = json.loads(request.body)
            url_to_scrape = data.get('url')

            if not url_to_scrape:
                return Response({'error': 'No URL provided'}, status=status.HTTP_400_BAD_REQUEST)

            options = ChromeOptions()
            #options.add_argument("--headless")


            driver = webdriver.Chrome(options=options)

            try:
                driver.get(url_to_scrape)

                wait = WebDriverWait(driver, 10)
                close_button = wait.until(EC.presence_of_element_located((By.XPATH, "//div[@aria-label='Close']")))
                close_button.click()
                time.sleep(2)

                while True:
                    try:
                        view_replies = driver.find_elements(By.XPATH, "//span[contains(text(),'View all') and contains(text(),'replies')]")
                        if not view_replies:
                            break
                        for view_reply in view_replies:
                            driver.execute_script("arguments[0].click();", view_reply)
                            time.sleep(2)
                    except:
                        break

                while True:
                    try:
                        host_replies = driver.find_elements(By.XPATH, "//span[contains(text(),'replied')] | //div[contains(text(),'replied')]")
                        if not host_replies:
                            break
                        for host_replies in host_replies:
                            driver.execute_script("arguments[0].click();", host_replies)
                            time.sleep(2)
                    except:
                        break

                time.sleep(2)

                comment_elements = driver.find_elements(By.XPATH, "//div[contains(@aria-label, 'Comment by')]")
                user_data = []

                for comment_element in comment_elements:
                    try:
                        name = comment_element.find_element(By.XPATH, ".//span[@class='x3nfvp2']").text
                        comment_text = comment_element.find_element(By.XPATH, ".//div[@class='xdj266r x11i5rnm xat24cr x1mh8g0r x1vvkbs']").text
                        emojis = comment_element.find_elements(By.XPATH, ".//img[@class='xz74otr']")
                        emoji_alts = [emoji.get_attribute("alt") for emoji in emojis]

                        user_data.append({
                            "name": name,
                            "comment": comment_text,
                            "emojis": emoji_alts,
                            "replies": []
                        })
                    except Exception as e:
                        print(f"Error extracting comment: {e}")

                reply_elements = driver.find_elements(By.XPATH, ".//div[contains(@aria-label, 'Reply by')]")
                for reply_element in reply_elements:
                    try:
                        reply_name = reply_element.find_element(By.XPATH, ".//span[@class='x3nfvp2']").text
                        reply_text = reply_element.find_element(By.XPATH, ".//div[@class='xdj266r x11i5rnm xat24cr x1mh8g0r x1vvkbs']").text
                        reply_emojis = reply_element.find_elements(By.XPATH, ".//img[@class='xz74otr']")
                        reply_emoji_alts = [emoji.get_attribute("alt") for emoji in reply_emojis]

                        parent_comment = None
                        for comment_element in reversed(comment_elements):
                            if comment_element.location['y'] < reply_element.location['y']:
                                parent_comment = comment_element
                                break

                        for data in user_data:
                            if data["comment"] in parent_comment.text:
                                data["replies"].append({
                                    "name": reply_name,
                                    "text": reply_text,
                                    "emojis": reply_emoji_alts
                                })
                                break
                    except Exception as e:
                        print(f"Error extracting reply: {e}")

                return Response(user_data, status=status.HTTP_200_OK)
            finally:
                driver.quit()

        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def get_hashtag_history(request):
    history = TwitterHashtagHistory.objects.all().order_by('-timestamp')
    history_data = [
        {
            'id': entry.id,
            'username': entry.username,
            'hashtag': entry.hashtag,
            'results': entry.results,
            'timestamp': entry.timestamp
        }
        for entry in history
    ]
    return JsonResponse(history_data, safe=False)

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def get_comment_history(request):
    history = TwitterCommentHistory.objects.all().order_by('-timestamp')
    history_data = [
        {
            'id': entry.id,
            'username': entry.username,
            'url': entry.url,
            'results': entry.results,
            'timestamp': entry.timestamp
        }
        for entry in history
    ]
    return JsonResponse(history_data, safe=False)

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def get_trend_history(request):
    history = TwitterTrendHistory.objects.all().order_by('-timestamp')
    history_data = [
        {
            'id': entry.id,
            'username': entry.username,
            'trend': entry.trend,
            'results': entry.results,
            'timestamp': entry.timestamp
        }
        for entry in history
    ]
    return JsonResponse(history_data, safe=False)

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def get_instagram_history(request):
    history = TwitterTrendHistory.objects.all().order_by('-timestamp')
    history_data = [
        {
            'id': entry.id,
            'username': entry.username,
            'trend': entry.trend,
            'results': entry.results,
            'timestamp': entry.timestamp
        }
        for entry in history
    ]
    return JsonResponse(history_data, safe=False)


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def get_facebook_history(request):
    history = FacebookHistory.objects.all().order_by('-timestamp')
    history_data = [
        {
            'id': entry.id,
            'username': entry.username,
            'url': entry.url,
            'results': entry.results,
            'timestamp': entry.timestamp
        }
        for entry in history
    ]
    return JsonResponse(history_data, safe=False)


class TwitterCommentHistoryViewSet(viewsets.ModelViewSet):
    queryset = TwitterCommentHistory.objects.all()
    serializer_class = TwitterCommentHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        if request.user.is_staff:
            queryset = self.queryset.all()
        else:
            username = request.query_params.get('username')
            if username:
                queryset = self.queryset.filter(username=username)
            else:
                queryset = self.queryset.none()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class TwitterHashtagHistoryViewSet(viewsets.ModelViewSet):
    queryset = TwitterHashtagHistory.objects.all()
    serializer_class = TwitterHashtagHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        if request.user.is_staff:
            queryset = self.queryset.all()
        else:
            username = request.query_params.get('username')
            if username:
                queryset = self.queryset.filter(username=username)
            else:
                queryset = self.queryset.none()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class TwitterTrendHistoryViewSet(viewsets.ModelViewSet):
    queryset = TwitterTrendHistory.objects.all()
    serializer_class = TwitterTrendHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        if request.user.is_staff:
            queryset = self.queryset.all()
        else:
            username = request.query_params.get('username')
            if username:
                queryset = self.queryset.filter(username=username)
            else:
                queryset = self.queryset.none()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
class InstagramHistoryViewSet(viewsets.ModelViewSet):
    queryset = InstagramHistory.objects.all()
    serializer_class = InstagramHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        if request.user.is_staff:
            queryset = self.queryset.all()
        else:
            username = request.query_params.get('username')
            if username:
                queryset = self.queryset.filter(username=username)
            else:
                queryset = self.queryset.none()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
class FacebookHistoryViewSet(viewsets.ModelViewSet):
    queryset = FacebookHistory.objects.all()
    serializer_class = FacebookHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        if request.user.is_staff:
            queryset = self.queryset.all()
        else:
            username = request.query_params.get('username')
            if username:
                queryset = self.queryset.filter(username=username)
            else:
                queryset = self.queryset.none()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)