from django.urls import path

from .views import MainMenuView
from .views import RoomCreateView
from .views import RoomJoinView
from .views import PlayerView
from .views import GameView

urlpatterns = [
    path('', MainMenuView.as_view(), name='main'),
    path('room/<str:passcode>/create/', RoomCreateView.as_view()),
    path('room/<str:passcode>/join/', RoomJoinView.as_view()),
    path('player/<str:name>/', PlayerView.as_view()),
    path('game/', GameView.as_view()),
]
