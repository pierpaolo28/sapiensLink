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
    permission_classes=(permissions.AllowAny,),
)

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
    path('register_user/', views.register_user),
    path('password_reset/', views.password_reset),
    path('password_reset_confirm/<uidb64>/<token>/', views.password_reset_confirm),
    path('login_user/', views.login_user),
    path('logout_user/', views.logout_user),
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]