# Generated by Django 4.2.20 on 2025-04-12 20:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0003_alter_budget_category'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='category',
            name='icon_url',
        ),
        migrations.AddField(
            model_name='category',
            name='category_color',
            field=models.CharField(blank=True, max_length=7, null=True),
        ),
    ]
