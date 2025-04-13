import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";
import API_BASE_URL from "./apiConfig";

import { BudgetStatusCard, MonthlyTotalsCard, OverallBalanceCard } from "./components/TopCards";
import CategoryExpenseChart from "./components/CategoryExpenseChartCard";

const MonthlyComparisonChart = ({ monthlyData }) => {
  const svgRef = React.useRef();

  useEffect(() => {
    if (!monthlyData || monthlyData.length === 0) return;

    const margin = { top: 30, right: 60, bottom: 50, left: 60 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(monthlyData.map((d) => d.month))
      .range([0, width])
      .padding(0.2);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    const maxValue = d3.max(monthlyData, (d) =>
      Math.max(d.income, d.expense, d.budget)
    );
    const y = d3
      .scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([height, 0]);

    svg.append("g").call(d3.axisLeft(y));

    const incomeLine = d3
      .line()
      .x((d) => x(d.month) + x.bandwidth() / 2)
      .y((d) => y(d.income))
      .curve(d3.curveMonotoneX);

    svg
      .append("path")
      .datum(monthlyData)
      .attr("fill", "none")
      .attr("stroke", "#4daf4a")
      .attr("stroke-width", 2)
      .attr("d", incomeLine);

    const expenseLine = d3
      .line()
      .x((d) => x(d.month) + x.bandwidth() / 2)
      .y((d) => y(d.expense))
      .curve(d3.curveMonotoneX);

    svg
      .append("path")
      .datum(monthlyData)
      .attr("fill", "none")
      .attr("stroke", "#e41a1c")
      .attr("stroke-width", 2)
      .attr("d", expenseLine);

    const budgetLine = d3
      .line()
      .x((d) => x(d.month) + x.bandwidth() / 2)
      .y((d) => y(d.budget))
      .curve(d3.curveMonotoneX);

    svg
      .append("path")
      .datum(monthlyData)
      .attr("fill", "none")
      .attr("stroke", "#377eb8")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("d", budgetLine);

    svg
      .selectAll(".dot-income")
      .data(monthlyData)
      .enter()
      .append("circle")
      .attr("class", "dot-income")
      .attr("cx", (d) => x(d.month) + x.bandwidth() / 2)
      .attr("cy", (d) => y(d.income))
      .attr("r", 4)
      .attr("fill", "#4daf4a");

    svg
      .selectAll(".dot-expense")
      .data(monthlyData)
      .enter()
      .append("circle")
      .attr("class", "dot-expense")
      .attr("cx", (d) => x(d.month) + x.bandwidth() / 2)
      .attr("cy", (d) => y(d.expense))
      .attr("r", 4)
      .attr("fill", "#e41a1c");

  }, [monthlyData]);

  return (
    <motion.div
      key="dash"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="p-4 rounded-xl shadow-lg bg-white"
    >
      <h2 className="text-lg font-bold mb-2">
        Monthly Budget
      </h2>
      <div className="flex justify-center mt-4 overflow-x-auto">
        <svg ref={svgRef}></svg>
      </div>

      <div className="flex justify-center gap-6 mb-4 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#4daf4a]"></span> Income
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#e41a1c]"></span> Expense
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-0.5 border-t-2 border-dashed border-[#377eb8]"></span> Budget
        </div>
      </div>
    </motion.div>
  );
};

const RecentTransactions = ({ transactions }) => {
  return (
    <motion.div
      key="dash"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="dashcard"
    >
      <h2 className="text-lg font-bold mb-2">
        Recent Transactions (income and expense)
      </h2>
      <div className="mt-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex justify-between items-center p-2 border-b border-gray-300"
          >
            <div>
              <p className="font-medium">{transaction.description || transaction.category_name}</p>
              <p className="text-xs text-gray-600">{transaction.date}</p>
            </div>
            <p
              className={`font-semibold ${
                transaction.type === "income"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {transaction.type === "income" ? "+" : "-"}Rs.
              {Math.abs(transaction.amount).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    monthlyBudget: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    overallBalance: 0,
    categories: [],
    monthlyData: [],
    recentTransactions: []
  });

  const getMonthAbbreviation = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('default', { month: 'short' });
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("Authentication token not found");
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const categoriesResponse = await fetch(`${API_BASE_URL}/api/categories/`, {
          headers: { Authorization: `Token ${token}` }
        });
        if (!categoriesResponse.ok) throw new Error("Failed to fetch categories");
        const categories = await categoriesResponse.json();
        
        const currentDate = new Date();
        const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;
        
        const budgetsResponse = await fetch(`${API_BASE_URL}/api/budgets/?month=${currentMonth}`, {
          headers: { Authorization: `Token ${token}` }
        });
        if (!budgetsResponse.ok) throw new Error("Failed to fetch budgets");
        const budgetsData = await budgetsResponse.json();
        
        const monthlyBudget = budgetsData.reduce((total, item) => total + parseFloat(item.amount), 0);
        
        const incomeResponse = await fetch(`${API_BASE_URL}/api/incomes/`,  {
          headers: { Authorization: `Token ${token}` }
        });
        if (!incomeResponse.ok) throw new Error("Failed to fetch incomes");
        const incomesData = await incomeResponse.json();
        
        const currentMonthIncomes = incomesData.results.filter(income => 
          income.date.startsWith(currentMonth.substring(0, 7))
        );
        const monthlyIncome = currentMonthIncomes.reduce((total, income) => 
          total + parseFloat(income.amount), 0
        );
        
        const expenseResponse = await fetch(`${API_BASE_URL}/api/expenses/`, {
          headers: { Authorization: `Token ${token}` }
        });
        if (!expenseResponse.ok) throw new Error("Failed to fetch expenses");
        const expensesData = await expenseResponse.json();
        
        const currentMonthExpenses = expensesData.results.filter(expense => 
          expense.date.startsWith(currentMonth.substring(0, 7))
        );
        const monthlyExpense = currentMonthExpenses.reduce((total, expense) => 
          total + parseFloat(expense.amount), 0
        );
        
        const allTimeIncome = incomesData.results.reduce((total, income) => 
          total + parseFloat(income.amount), 0
        );
        const allTimeExpense = expensesData.results.reduce((total, expense) => 
          total + parseFloat(expense.amount), 0
        );
        const overallBalance = allTimeIncome - allTimeExpense;
        
        const expenseCategories = categories.filter(cat => cat.type === "expense");
        
        const categoriesWithBudgetAndActual = expenseCategories.map(category => {
          const categoryBudget = budgetsData.find(b => b.category === category.id);
          
          const categoryExpenses = currentMonthExpenses.filter(e => e.category === category.id);
          const actualSpending = categoryExpenses.reduce((total, exp) => 
            total + parseFloat(exp.amount), 0
          );
          
          return {
            name: category.name,
            budget: categoryBudget ? parseFloat(categoryBudget.amount) : 0,
            actual: actualSpending
          };
        });
        
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date();
          monthDate.setMonth(monthDate.getMonth() - i);
          const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
          
          const monthIncomes = incomesData.results.filter(income => 
            income.date.startsWith(monthStr)
          );
          const monthIncomeTotal = monthIncomes.reduce((total, income) => 
            total + parseFloat(income.amount), 0
          );
          
          const monthExpenses = expensesData.results.filter(expense => 
            expense.date.startsWith(monthStr)
          );
          const monthExpenseTotal = monthExpenses.reduce((total, expense) => 
            total + parseFloat(expense.amount), 0
          );
          
          const monthBudgetsResponse = await fetch(`${API_BASE_URL}/api/budgets/?month=${monthStr}-01`, {
            headers: { Authorization: `Token ${token}` }
          });
          const monthBudgets = await monthBudgetsResponse.json();
          const monthBudgetTotal = monthBudgets.reduce((total, item) => 
            total + parseFloat(item.amount), 0
          );
          
          monthlyData.push({
            month: getMonthAbbreviation(monthStr + "-01"),
            income: monthIncomeTotal,
            expense: monthExpenseTotal,
            budget: monthBudgetTotal || 0  
          });
        }
        
        const allTransactions = [
          ...incomesData.results.map(income => ({
            ...income,
            type: "income",
            category_name: categories.find(c => c.id === income.category)?.name || "Income"
          })),
          ...expensesData.results.map(expense => ({
            ...expense,
            type: "expense",
            category_name: categories.find(c => c.id === expense.category)?.name || "Expense"
          }))
        ];
        
        allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const recentTransactions = allTransactions.slice(0, 8);
        
        setDashboardData({
          monthlyBudget,
          monthlyIncome,
          monthlyExpense,
          overallBalance,
          categories: categoriesWithBudgetAndActual,
          monthlyData,
          recentTransactions
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Error loading dashboard: {error}</p>
        <p>Please check your connection and try again.</p>
      </div>
    );
  }

  return (
    <motion.div
      key="dash"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-3 gap-4 mb-4"> 
        <div className="col-span-1">
          <OverallBalanceCard balance={dashboardData.overallBalance} />
        </div>
        <div className="col-span-1">
          <BudgetStatusCard
            budget={dashboardData.monthlyBudget}
            expense={dashboardData.monthlyExpense}
          />
        </div>
        <div className="col-span-1 md:col-span-2 2xl:col-span-1">
          <MonthlyTotalsCard
            income={dashboardData.monthlyIncome}
            expense={dashboardData.monthlyExpense}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <CategoryExpenseChart categories={dashboardData.categories} />
        <MonthlyComparisonChart monthlyData={dashboardData.monthlyData} />
      </div>

      <div className="mb-4">
        <RecentTransactions transactions={dashboardData.recentTransactions} />
      </div>
    </motion.div>
  );
}