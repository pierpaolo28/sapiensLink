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
    path('get_list/<str:pk>/', views.get_list),
    path('vote/<str:pk>/<str:action>/', views.vote),
    path('user_profile/<str:pk>/', views.user_profile),
    path('private_lists/<str:pk>/', views.private_lists),
    path('delete_comment/<str:pk>/', views.delete_comment),
    path('topics_page/', views.topics_page),
    path('who_to_follow_page/', views.who_to_follow_page),
    path('delete_account/', views.delete_account),
    path('list_pr/<str:pk>/', views.list_pr),
    path('approve_suggestion/<str:suggestion_id>/', views.approve_suggestion),
    path('decline_suggestion/<str:suggestion_id>/', views.decline_suggestion),
    path('delete_pr_comment/<str:comment_id>/', views.delete_pr_comment),
    path('saved_lists/<str:pk>/', views.saved_lists),
]