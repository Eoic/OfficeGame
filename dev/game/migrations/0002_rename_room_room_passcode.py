# Generated by Django 5.0.6 on 2024-06-23 16:00

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='room',
            old_name='room',
            new_name='passcode',
        ),
    ]
