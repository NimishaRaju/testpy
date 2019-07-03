from django.urls import path
from . import views
from django.conf.urls import url

urlpatterns = [
    path('', views.home_page, name='home_page'),
    path('ajax_route/', views.get_directions, name='ajax_route'),
    path('weather_route/', views.refresh_weather, name='weather_route'),

]
