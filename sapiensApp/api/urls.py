from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('',  views.getRoutes),
    path('mass-lists/', views.mass_list_upload),
    path('mass-users/', views.mass_users_upload),
    path('lists/', views.lists),
    path('list/<str:pk>/', views.list),
    path('users/', views.users),
    path('user/<str:pk>/', views.user),
    path('reports/', views.reports),
    path('report/<str:pk>/', views.report),
    path('notifications/', views.get_notifications, name='get_notifications'),
    path('notifications/<int:notification_id>/mark_as_read/', views.mark_notification_as_read, name='mark_notification_as_read'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('get_home_lists/', views.get_home_lists),
]