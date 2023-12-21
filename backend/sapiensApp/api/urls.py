from django.urls import path, re_path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="SapiensLink API",
        default_version='v1',
        description="SapiensLink API Documentation",
        terms_of_service="TODO Link to Terms",
        contact=openapi.Contact(email="sapienslink@gmail.com"),
        license=openapi.License(name="TODO Decide"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,)
)

urlpatterns = [
    path('',  views.getRoutes),
    path('login_user/', views.login_user),
    path('revoke_token/', views.revoke_token),
    path('logout_user/', views.logout_user),
    path('register_user/', views.register_user),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('password_reset/', views.password_reset),
    path('password_reset_confirm/<uidb64>/<token>/', views.password_reset_confirm),
    path('user_profile_page/<str:pk>/', views.user_profile_page),
    path('update_user_page/', views.update_user_page),
    path('delete_user_page/', views.delete_user_page),
    path('home_page/', views.home_page),
    path('topics_page/', views.topics_page),
    path('who_to_follow_page/', views.who_to_follow_page),
    path('create_list_page', views.create_list_page),
    path('list_page/<str:pk>/', views.list_page),
    path('delete_comment_action/<str:pk>/', views.delete_comment_action),
    path('update_list_page/<str:pk>/', views.update_list_page),
    path('list_pr_page/<str:pk>/', views.list_pr_page),
    path('approve_suggestion_action/<str:suggestion_id>/', views.approve_suggestion_action),
    path('approve_suggestion_action/<str:suggestion_id>/', views.approve_suggestion_action),
    path('delete_pr_comment_action/<str:comment_id>/', views.delete_pr_comment_action),
    path('private_lists_page/<str:pk>/', views.private_lists_page),
    path('saved_content_page/<str:pk>/', views.saved_content_page),
    path('report_list_page/<str:pk>/', views.report_list_page),
    path('vote_action/<str:pk>/<str:action>/', views.vote_action),
    path('rank_home/', views.rank_home),
    path('vote_rank/<str:pk>/<str:content_index>/<str:action>/', views.vote_rank),
    path('create_rank_page/', views.create_rank_page),
    path('rank_topics_page/', views.rank_topics_page),
    path('report_rank_page/', views.report_rank_page),
    path('rank_page/<str:pk>/', views.rank_page),
    path('notifications/', views.get_notifications, name='get_notifications'),
    path('manage_subscription/<str:type>/<str:id>/', views.manage_subscription, name="manage_subscription"),
    path('notifications/<int:notification_id>/mark_as_read/', views.mark_notification_as_read, name='mark_notification_as_read'),
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('email_unsubscribe/', views.email_unsubscribe, name='email_unsubscribe'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('lists_db_setup/', views.lists_db_setup),
    path('users_db_setup/', views.users_db_setup),
    path('update_rank/<str:pk>/', views.update_rank),
    path('delete_rank/<str:pk>/', views.delete_rank),
    path('ranks_db_setup/', views.ranks_db_setup)
]