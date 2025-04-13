import React, { useState, useEffect } from "react";
import CategoryList from "./components/CategoryListCard";
import HistoricalBudgetChart from "./components/HistoricalBugetChartCard";
import { motion } from "framer-motion";
import API_BASE_URL from "../../apiConfig";

export default function Budget() {
  const [token, setToken] = useState(
    () => localStorage.getItem("auth_token") || ""
  );
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [budgetData, setBudgetData] = useState({
    current: { month: "", categories: [], totalBudget: 0 },
    history: [],
    allCategories: [],
  });
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/categories/`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);

        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch categories:", err);
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/budgets/`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          processAndSetBudgetData(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch budgets:", err);
        setLoading(false);
      });
  }, [token]);

  const processAndSetBudgetData = (rawData) => {
    const sortedData = [...rawData].sort((a, b) => {
      return new Date(b.month) - new Date(a.month);
    });

    const uniqueMonths = [...new Set(sortedData.map((item) => item.month))];

    if (uniqueMonths.length === 0) return;

    const currentMonth = uniqueMonths[0];
    const currentMonthData = sortedData.filter(
      (item) => item.month === currentMonth
    );

    const currentCategories = currentMonthData.map((item) => {
      const category = categories.find((cat) => cat.id === item.category) || {
        id: item.category,
        name: `Category ${item.category}`,
      };
      return {
        id: item.category,
        name: category.name,
        budget: parseFloat(item.amount),
      };
    });

    const currentTotalBudget = currentCategories.reduce(
      (sum, cat) => sum + cat.budget,
      0
    );

    const formatMonth = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    };

    const history = uniqueMonths.slice(1).map((month) => {
      const monthData = sortedData.filter((item) => item.month === month);
      const monthCategories = monthData.map((item) => {
        const category = categories.find((cat) => cat.id === item.category) || {
          id: item.category,
          name: `Category ${item.category}`,
        };
        return {
          id: item.category,
          name: category.name,
          budget: parseFloat(item.amount),
        };
      });

      const monthTotalBudget = monthCategories.reduce(
        (sum, cat) => sum + cat.budget,
        0
      );

      return {
        month: formatMonth(month),
        categories: monthCategories,
        totalBudget: monthTotalBudget,
      };
    });

    setBudgetData({
      current: {
        month: formatMonth(currentMonth),
        categories: currentCategories,
        totalBudget: currentTotalBudget,
      },
      history: history,
      allCategories: budgetData.allCategories,
    });
  };

  const allMonths = [
    budgetData.current.month,
    ...budgetData.history.map((h) => h.month),
  ];

  const getCurrentData = () => {
    if (currentMonthIndex === 0) {
      return budgetData.current;
    } else {
      return budgetData.history[currentMonthIndex - 1];
    }
  };

  const currentData = getCurrentData();

  const handleMonthChange = (index) => {
    setCurrentMonthIndex(index);
  };

  const handleCategoryUpdate = (id, newBudget) => {
    if (currentMonthIndex === 0) {
      setBudgetData((prevData) => ({
        ...prevData,
        current: {
          ...prevData.current,
          categories: prevData.current.categories.map((cat) =>
            cat.id === id ? { ...cat, budget: newBudget } : cat
          ),
          totalBudget: prevData.current.categories.reduce(
            (sum, cat) => sum + (cat.id === id ? newBudget : cat.budget),
            0
          ),
        },
      }));

      updateBudgetOnServer(id, newBudget);
    }
  };

  const updateBudgetOnServer = (categoryId, amount) => {
    const monthStr = budgetData.current.month; 

    const parts = monthStr.split(" ");
    if (parts.length !== 2) {
      console.error("Invalid month format:", monthStr);
      return;
    }

    const monthName = parts[0]; 
    const year = parseInt(parts[1]); 

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthIndex = months.indexOf(monthName);

    if (monthIndex === -1 || isNaN(year)) {
      console.error("Failed to parse month:", monthStr);
      return;
    }

    const formattedDate = `${year}-${String(monthIndex + 1).padStart(
      2,
      "0"
    )}-01`;

    console.log("Formatted date:", formattedDate);
    fetch(
      `${API_BASE_URL}/api/budgets/?category=${categoryId}&month=${formattedDate}`,
      {
        headers: { Authorization: `Token ${token}` },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const budgetId = data[0].id;
          fetch(`${API_BASE_URL}/api/budgets/${budgetId}/`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
            body: JSON.stringify({
              month: formattedDate,
              amount: amount,
              category: categoryId,
            }),
          })
            .then((res) => {
              if (!res.ok) throw new Error("Failed to update budget");
              return res.json();
            })
            .catch((err) => console.error("Error updating budget:", err));
        } else {
          fetch(`${API_BASE_URL}/api/budgets/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
            body: JSON.stringify({
              month: formattedDate,
              amount: amount,
              category: categoryId,
            }),
          })
            .then((res) => {
              if (!res.ok) throw new Error("Failed to create budget");
              return res.json();
            })
            .catch((err) => console.error("Error creating budget:", err));
        }
      })
      .catch((err) => console.error("Error checking existing budget:", err));
  };

  const handleAddCategory = (categoryName, budget) => {
    if (currentMonthIndex === 0) {
      const categoryObj = categories.find(
        (cat) => cat.name === categoryName && cat.type === "expense"
      );

      if (!categoryObj) {
        console.error("Category not found or not an expense category");
        return;
      }

      const categoryId = categoryObj.id;

      const existingCategory = budgetData.current.categories.find(
        (cat) => cat.id === categoryId
      );

      if (existingCategory) {
        console.error("Category already exists in current month");
        return;
      }

      setBudgetData((prevData) => ({
        ...prevData,
        current: {
          ...prevData.current,
          categories: [
            ...prevData.current.categories,
            { id: categoryId, name: categoryName, budget },
          ],
          totalBudget: prevData.current.totalBudget + budget,
        },
      }));

      updateBudgetOnServer(categoryId, budget);
    }
  };

  const handleTotalBudgetChange = (newTotal) => {
    if (currentMonthIndex === 0) {
      const currentTotal = budgetData.current.categories.reduce(
        (sum, cat) => sum + cat.budget,
        0
      );

      if (currentTotal === 0) return;

      const ratio = newTotal / currentTotal;

      const updatedCategories = budgetData.current.categories.map((cat) => ({
        ...cat,
        budget: Math.round(cat.budget * ratio * 100) / 100,
      }));

      setBudgetData((prevData) => ({
        ...prevData,
        current: {
          ...prevData.current,
          categories: updatedCategories,
          totalBudget: newTotal,
        },
      }));

      updatedCategories.forEach((cat) => {
        updateBudgetOnServer(cat.id, cat.budget);
      });
    }
  };

  const isReadOnly = currentMonthIndex !== 0;

  if (loading) {
    return <div className="p-6">Loading budget data...</div>;
  }

  return (
    <motion.div
      key="budget"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <h1 className="text-2xl font-bold mb-6">Category and Budget</h1>

      <MonthNavigation
        months={allMonths}
        currentMonthIndex={currentMonthIndex}
        onMonthChange={handleMonthChange}
      />

      <div className="grid grid-cols-2 gap-4 mt-4 max-lg:grid-cols-1">
        <CategoryList
          isReadOnly={isReadOnly}
          categories={currentData.categories.filter((cat) => {
            const originalCat = categories.find((c) => c.id === cat.id);
            return originalCat && originalCat.type === "expense"; 
          })}
          onCategoryUpdate={handleCategoryUpdate}
          availableCategories={
            categories
              .filter((cat) => cat.type === "expense")
              .map((cat) => cat.name)
          }
          onAddCategory={handleAddCategory}
        />
        <div className="grid grid-rows-3 gap-4 h-fit">
          <TotalBudget
            isReadOnly={isReadOnly}
            totalBudget={currentData.totalBudget}
            onTotalBudgetChange={handleTotalBudgetChange}
          />
          <div className="row-span-2">
            <HistoricalBudgetChart
              historyData={budgetData.history}
              currentMonth={budgetData.current}
            />
          </div>
        </div>
      </div>

      {isReadOnly && (
        <div className="mt-8 p-3 bg-yellow-100 border border-yellow-400 rounded">
          <p className="text-yellow-800">
            You are viewing historical data. Editing is only available for the
            current month.
          </p>
        </div>
      )}
    </motion.div>
  );
}

const MonthNavigation = ({ months, currentMonthIndex, onMonthChange }) => (
  <motion.div
    key="budget"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, delay: 0.2 }}
    className="bg-white shadow-md rounded-lg px-6 py-4 flex justify-between items-center"
  >
    <button
      onClick={() => onMonthChange(currentMonthIndex + 1)}
      disabled={currentMonthIndex >= months.length - 1}
      className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-900 disabled:opacity-40"
    >
      &lt; Previous
    </button>
    <span className="text-xl font-semibold text-gray-700">
      {months[currentMonthIndex]}
    </span>
    <button
      onClick={() => onMonthChange(currentMonthIndex - 1)}
      disabled={currentMonthIndex <= 0}
      className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-900 disabled:opacity-40"
    >
      Next &gt;
    </button>
  </motion.div>
);

const TotalBudget = ({ isReadOnly, onTotalBudgetChange, totalBudget }) => {
  const [editingTotal, setEditingTotal] = useState(false);
  const [newTotal, setNewTotal] = useState(totalBudget.toString());

  useEffect(() => {
    setNewTotal(totalBudget.toString());
  }, [totalBudget]);

  const handleSave = () => {
    const numValue = parseFloat(newTotal);
    if (!isNaN(numValue) && numValue >= 0) {
      onTotalBudgetChange(numValue);
      setEditingTotal(false);
    }
  };

  return (
    <motion.div
      key="budget"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="flex-grow shadow-md rounded-2xl flex flex-col justify-center"
    >
      <div className="p-6">
        <h2 className="text-xl font-bold mb-3">Monthly Total Budget</h2>
        <div className="flex justify-between items-center">
          <span className="font-medium text-muted-foreground">Total:</span>
          {editingTotal ? (
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={newTotal}
                onChange={(e) => setNewTotal(e.target.value)}
                className="w-24 p-2 border rounded"
              />
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-900 disabled:opacity-40"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold">
                Rs.{totalBudget.toFixed(2)}
              </span>
              {isReadOnly ? (
                ""
              ) : (
                <button
                  onClick={() => setEditingTotal(true)}
                  className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-900 disabled:opacity-40"
                >
                  Edit
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
