from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Category(models.Model):
    TYPE_CHOICES = (
        ('income', 'Income'),
        ('expense', 'Expense'),
    )
    name = models.CharField(max_length=50)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category_color = models.CharField(max_length=7, blank=True, null=True)  # e.g., '#FF5733'

    def __str__(self):
        return f"{self.name} ({self.type})"



class Income(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, limit_choices_to={'type': 'income'}, on_delete=models.CASCADE, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(default=timezone.now)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Income: {self.amount} - {self.category}"


class Expense(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, limit_choices_to={'type': 'expense'}, on_delete=models.CASCADE, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(default=timezone.now)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Expense: {self.amount} - {self.category}"


class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, limit_choices_to={'type': 'expense'}, on_delete=models.CASCADE, null=True)
    month = models.DateField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ('user', 'month', 'category')

    def __str__(self):
        return f"{self.user.username} - Budget for {self.month.strftime('%B %Y')} - {self.category.name}"


