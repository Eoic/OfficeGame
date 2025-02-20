import json
import uuid
from channels.generic.websocket import WebsocketConsumer
from .constants import SERVERS

SERVERS['ABC123'] = {
    's7e8u21kvhxnvu0akgur5qkxr075eph2': { 'player': 'ScyTeM', 'id': f'{uuid.uuid4()}', 'connected': False, 'position': [0, 0, 0], 'rotation': [0, 0, 0], 'bullets': {} },
    'z8jmrj53wugv4rxnmy3ulh0f54eym1pj': { 'player': 'P1', 'id': f'{uuid.uuid4()}', 'connected': False, 'position': [0, 0, 0], 'rotation': [0, 0, 0], 'bullets': {} },
}

class GameConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        
    def disconnect(self, close_code):
        SERVERS[self.room][self.player]['connected'] = False
    
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        
        event = text_data_json['event']
        message = text_data_json['data']

        if event == 'update':
            self.handle_update(message, text_data_json['room'], text_data_json['player'])
        
    # Handling an update message
    def handle_update(self, message, room, player):
        self.room = room
        self.player = player
        SERVERS[self.room][self.player]['connected'] = True
        SERVERS[self.room][self.player]['position'] = message['position']
        SERVERS[self.room][self.player]['rotation'] = message['rotation']
        SERVERS[self.room][self.player]['bullets'] = message['bullets']
        # Updating some pos and other stats
        
        data = []
        for pl in SERVERS[self.room]:
            if pl == self.player:
                continue
            data.append(SERVERS[self.room][pl])
        
        self.send(text_data=json.dumps({
           'type': 'game_message',
           'event': 'update',
           'data': data
        }))