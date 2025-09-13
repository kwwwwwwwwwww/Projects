from django.contrib import admin
from django.urls import path, include
from api.views import CreateUserView, MyTokenObtainPairView, UserListView, delete_users, delete_history
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/user/register/', CreateUserView.as_view(), name='register'),
    path('api/token/', MyTokenObtainPairView.as_view(), name='get_token'), 
    path('api/token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('api-auth/', include('rest_framework.urls')),
    path('api/users/', UserListView.as_view(), name='user-list'),
    path('api/delete_users/', delete_users, name='delete_users'),
    path('api/delete-history/', delete_history, name='delete_history'),
    path('api/', include('api.urls')),  
]
