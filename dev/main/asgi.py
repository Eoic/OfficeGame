import os

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from django.urls import path
from game.consumers import GameConsumer

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "main.settings-dev")

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": URLRouter(
            [
                path("ws/game/", GameConsumer.as_asgi()),
            ]
        ),
    }
)
