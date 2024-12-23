from django.urls import path
from django.views.generic.base import TemplateView
from . import views
from django.contrib.auth import views as auth_views
from django.urls import path, include


urlpatterns = [
    path('login/', views.loginPage, name="login"),
    path('logout/', views.logoutUser, name="logout"),
    path('register/', views.registerPage, name="register"),
    path('', views.index, name="index"),
    path('home', views.home, name="home"),
    path('home/<str:follow>/<str:top_voted>', views.home, name="custom_home"),
    path('list/<str:pk>/', views.list, name="list"),
    path('profile/<str:pk>/', views.userProfile, name="profile"),
    path('private_lists/<str:pk>/', views.private_lists, name="private_lists"),
    path('create_list/', views.createList, name="create_list"),
    path('update_list/<str:pk>/', views.updateList, name="update_list"),
    path('delete_list/<str:pk>/', views.deleteList, name="delete_list"),
    path('delete_comment/<str:pk>/', views.deleteComment, name="delete_comment"),
    path('update_user/', views.updateUser, name="update_user"),
    path('topics/', views.topicsPage, name="topics"),
    path('who_to_follow/', views.whoToFollowPage, name="who_to_follow"),
    path('vote/<str:pk>/<str:action>/', views.vote, name='vote'),
    path('report/<str:pk>/', views.report_list, name='report_list'),
    path('delete-account/', views.delete_account, name='delete_account'),
    path('list_pr/<str:pk>/', views.list_pr, name='list_pr'),
    path('list_suggestion/approve/<str:suggestion_id>/', views.approve_suggestion, name='approve_suggestion'),
    path('list_suggestion/decline/<str:suggestion_id>/', views.decline_suggestion, name='decline_suggestion'),
    path('comment_pr/delete/<str:comment_id>/', views.delete_pr_comment, name='delete_pr_comment'),
    path('about/', TemplateView.as_view(template_name='pages/about.html'), name='about'),
    path('contacts/', TemplateView.as_view(template_name='pages/contacts.html'), name='contacts'),
    path('saved_lists/<str:pk>', views.savedListsPage, name="saved_lists"),
    path('reset_password', auth_views.PasswordResetView.as_view(template_name='pages/password_reset_form.html'), name="password_reset"),
    path('reset_password_sent', auth_views.PasswordResetDoneView.as_view(template_name='pages/password_reset_done.html'), name="password_reset_done"),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(template_name='pages/password_reset_confirm.html'), name="password_reset_confirm"),
    path('reset_password_complete', auth_views.PasswordResetCompleteView.as_view(template_name='pages/password_reset_complete.html'), name="password_reset_complete"),
    path('rank_home', views.rank_home, name="rank_home"),
    path('rank_home/<str:top_voted>', views.rank_home, name="custom_rank_home"),
    path('create_rank/', views.createRank, name="create_rank"),
    path('rank/<str:pk>/', views.rank, name="rank"),
    path('report_rank/<str:pk>/', views.report_rank, name='report_rank'),
    path('vote_rank/<str:pk>/<str:content_index>/<str:action>/', views.vote_rank, name='vote_rank'),
    path('rank_topics/', views.rankTopicsPage, name="rank_topics"),
]
