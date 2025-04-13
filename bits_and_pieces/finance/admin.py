# admin.py
from django.contrib import admin
from django.urls import path, reverse
from django.shortcuts import render, redirect
from .models import Category, Income, Expense, Budget


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'user', 'category_color')
    search_fields = ('name', 'type', 'user__username')


@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):
    list_display = ('user', 'category', 'amount', 'date', 'notes')
    list_filter = ('category', 'date')
    search_fields = ('category__name', 'notes')


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('user', 'category', 'amount', 'date', 'notes')
    list_filter = ('category', 'date')
    search_fields = ('category__name', 'notes')


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('user', 'month', 'amount', 'category')
    list_filter = ('user', 'month')
    search_fields = ('user__username',)
    list_filter = ('category', 'month')

