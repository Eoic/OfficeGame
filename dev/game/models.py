from django.db import models

class Room(models.Model):
    passcode = models.CharField(max_length=16, unique=True, blank=False, null=False)
    
class Player(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, blank=True, null=True)
    session = models.CharField(max_length=256, blank=True, null=True)
    name = models.CharField(max_length=32, blank=False, null=False)
    total_kills = models.IntegerField(default=0)
    total_deaths = models.IntegerField(default=0)
    kills = models.IntegerField(default=0)
    deaths = models.IntegerField(default=0)
    money = models.IntegerField(default=0)