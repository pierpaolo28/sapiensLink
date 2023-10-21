from django.urls import path
from . import views

urlpatterns = [
    path('',  views.getRoutes),
    path('lists/', views.getLists),
    path('list/<str:pk>/', views.getList),
]