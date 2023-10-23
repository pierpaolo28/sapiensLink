from django.urls import path
from django.views.generic.base import TemplateView
from . import views

urlpatterns = [
    path('login/', views.loginPage, name="login"),
    path('logout/', views.logoutUser, name="logout"),
    path('register/', views.registerPage, name="register"),
    path('', views.index, name="index"),
    path('home', views.home, name="home"),
    path('home/<str:follow>/<str:top_voted>', views.home, name="custom_home"),
    path('list/<str:pk>/', views.list, name="list"),
    path('profile/<str:pk>/', views.userProfile, name="profile"),
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
]
