import django_filters
from itertools import chain
from operator import attrgetter
from django.contrib.auth.models import User
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, NumberFilter

from rest_framework import viewsets, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token

from .models import Category, Income, Expense, Budget
from .serializers import (
    CategorySerializer,
    IncomeSerializer,
    ExpenseSerializer,
    BudgetSerializer,
    TransactionSerializer,
)



# Custom filter sets for transactions
class TransactionFilterSet(FilterSet):
    min_amount = NumberFilter(field_name="amount", lookup_expr='gte')
    max_amount = NumberFilter(field_name="amount", lookup_expr='lte')
    category = django_filters.ModelChoiceFilter(queryset=Category.objects.all())
    
    class Meta:
        fields = ['category', 'min_amount', 'max_amount']



class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.none() 
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None 

    def get_queryset(self):
        user = self.request.user
        category_type = self.request.query_params.get('type')
        qs = Category.objects.filter(user=user)
        if category_type in ['income', 'expense']:
            qs = qs.filter(type=category_type)
        return qs
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class IncomeViewSet(viewsets.ModelViewSet):
    queryset = Income.objects.none() 
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = TransactionFilterSet
    ordering_fields = ['date', 'amount']
    ordering = ['-date']  # Default ordering
    
    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.none() 
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = TransactionFilterSet
    ordering_fields = ['date', 'amount']
    ordering = ['-date']  # Default ordering
    
    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '')

        if not username or not password:
            return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already taken.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password, email=email)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key}, status=status.HTTP_201_CREATED)

class TransactionViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        user = request.user
        income_qs = Income.objects.filter(user=user)
        expense_qs = Expense.objects.filter(user=user)

        # Add 'type' manually
        for income in income_qs:
            income.type = 'income'
        for expense in expense_qs:
            expense.type = 'expense'

        # Combine and sort by date descending
        combined = sorted(
            chain(income_qs, expense_qs),
            key=attrgetter('date'),
            reverse=True
        )

        serializer = TransactionSerializer(combined, many=True)
        return Response(serializer.data)






class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.all() 
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None 

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
