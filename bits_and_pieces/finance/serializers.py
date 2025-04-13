from rest_framework import serializers
from .models import Category, Income, Expense, Budget

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'type', 'category_color']
        read_only_fields = ['user']

class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = ['id', 'category', 'amount', 'date', 'notes']
        read_only_fields = ['user']

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['id', 'category', 'amount', 'date', 'notes']
        read_only_fields = ['user']


class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = '__all__'
        read_only_fields = ['user']
        
class TransactionSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    category = serializers.CharField(source='category.name')
    category_color = serializers.CharField(source='category.category_color', allow_null=True, allow_blank=True)
    type = serializers.CharField()
    date = serializers.DateField()
    notes = serializers.CharField(allow_null=True, allow_blank=True)
