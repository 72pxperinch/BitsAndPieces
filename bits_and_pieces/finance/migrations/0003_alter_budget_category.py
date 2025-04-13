# Generated by Django 4.2.20 on 2025-04-12 19:24

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0002_alter_budget_unique_together_budget_category_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='budget',
            name='category',
            field=models.ForeignKey(limit_choices_to={'type': 'expense'}, null=True, on_delete=django.db.models.deletion.SET_NULL, to='finance.category'),
        ),
    ]
