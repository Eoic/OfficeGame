# Generated by Django 5.0.6 on 2024-06-23 16:15

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0003_player_session'),
    ]

    operations = [
        migrations.AlterField(
            model_name='player',
            name='room',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='game.room'),
        ),
    ]
