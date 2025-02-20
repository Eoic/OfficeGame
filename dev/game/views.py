import uuid
from typing import Any
from django.http import HttpRequest
from django.http.response import HttpResponse as HttpResponse
from django.http import HttpResponseRedirect
from django.shortcuts import redirect
from django.views.generic import TemplateView
from django.views.generic import CreateView
from django.views.generic import View
from .models import Room
from .models import Player
from .constants import SERVERS

class MainMenuView(TemplateView):
    template_name = 'menu.html'
    
    def get_context_data(self, **kwargs: Any):
        context = super().get_context_data(**kwargs)
        context['player'] = self.request.session.get('player', 'unknown')
        context['panel_open'] = self.request.session.get('panel_open', None)
        context['error'] = self.request.session.get('error', None)
        context['server'] = self.request.session.get('server', None)

        if self.request.session.has_key('panel_open'):
            del self.request.session['panel_open']
            
        if self.request.session.has_key('error'):
            del self.request.session['error']

        return context


class RoomCreateView(View):
    model = Room
    
    def get(self, request, passcode):
        if passcode in SERVERS:
            request.session['panel_open'] = 'room_create'
            request.session['error'] = {
                'type': 'room_create',
                'message': 'Room already exsists :P'
            }
            return HttpResponseRedirect('/')
            
        request.session['server'] = passcode
        SERVERS[passcode] = {}
        SERVERS[passcode][request.session.session_key] = {
            'player': request.session['player']
        }
        return HttpResponseRedirect('/game/')
        
        
class RoomJoinView(View):
    model = Room
    
    def get(self, request, passcode):
        if passcode not in SERVERS:
            request.session['panel_open'] = 'room_join'
            request.session['error'] = {
                'type': 'room_join',
                'message': 'Room does not exist ;('
            }       
            return HttpResponseRedirect('/')
        
        request.session['server'] = passcode
        SERVERS[passcode][request.session.session_key] = {
            'player': request.session['player']
        }
        return HttpResponseRedirect('/game/')
    

class PlayerView(View):
    def get(self, request, name):
        request.session['player'] = name
        request.session['panel_open'] = 'player'
        return HttpResponseRedirect('/')
    

class GameView(TemplateView):
    template_name = 'game.html'
    
    def get_context_data(self, **kwargs: Any):
        # FAKE DATA
        self.request.session['server'] = 'ABC123'
        self.request.session['player'] = 'ScyTeM'
        
        context = super().get_context_data(**kwargs)
        context['player'] = self.request.session.get('player', 'unknown')
        context['panel_open'] = self.request.session.get('panel_open', None)
        context['error'] = self.request.session.get('error', None)
        context['server'] = self.request.session.get('server', None)

        if self.request.session.has_key('panel_open'):
            del self.request.session['panel_open']
            
        if self.request.session.has_key('error'):
            del self.request.session['error']

        return context
    