from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.loginPage, name="login"),
    path('logout/', views.logoutUser, name="logout"),
    path('register/', views.registerPage, name="register"),

    path('', views.home, name="home"),
    path('list/<str:pk>/', views.list, name="list"),
    path('profile/<str:pk>/', views.userProfile, name="user-profile"),

    path('create-list/', views.createList, name="create-list"),
    path('update-list/<str:pk>/', views.updateList, name="update-list"),
    path('delete-list/<str:pk>/', views.deleteList, name="delete-list"),
    path('delete-message/<str:pk>/', views.deleteMessage, name="delete-message"),

    path('update-user/', views.updateUser, name="update-user"),

    path('topics/', views.topicsPage, name="topics"),
    path('whotofollow/', views.whoToFollowPage, name="activity"),
]
