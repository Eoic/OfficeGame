# Generated by Django 5.0.6 on 2024-06-23 16:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0002_rename_room_room_passcode'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='session',
            field=models.CharField(blank=True, max_length=256, null=True),
        ),
    ]
