import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

function TransactionList({ title, apiEndpoint, categoryOptions }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("-date"); 
  const [filter, setFilter] = useState(""); 
  const [minAmount, setMinAmount] = useState(0);
  const [maxAmount, setMaxAmount] = useState(9999);

  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    date: "",
  });

  useEffect(() => {
    if (categoryOptions.length > 0 && !formData.category) {
      setFormData((prev) => ({ ...prev, category: categoryOptions[0]?.id }));
    }
  }, [categoryOptions]);

  const fetchTransactions = () => {
    setLoading(true);
    const token = localStorage.getItem("auth_token");
    
    const params = new URLSearchParams({
      page: currentPage,
      ordering: sortBy,
    });
    
    if (filter) {
      params.append("category", parseInt(filter));
    }
    
    if (minAmount > 0) {
      params.append("min_amount", minAmount);
    }
    
    if (maxAmount < 9999) {
      params.append("max_amount", maxAmount);
    }

    fetch(`${apiEndpoint}?${params.toString()}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setTransactions(data.results || []);
        setTotalPages(Math.ceil((data.count || 0) / 10));
        setLoading(false);
      })
      .catch((err) => {
        console.error(`Error fetching ${title} data:`, err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, sortBy, filter, minAmount, maxAmount, apiEndpoint]);

  const handleAddTransaction = () => {
    if (!formData.amount || !formData.date || !formData.category) return;

    const token = localStorage.getItem("auth_token");
    setLoading(true);

    fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        return res.json();
      })
      .then(() => {
        setFormData({ amount: "", category: categoryOptions[0]?.id, date: "" });
        setCurrentPage(1);
        fetchTransactions();
      })
      .catch((err) => {
        console.error(`Error adding ${title}:`, err);
        setLoading(false);
      });
  };

  const categoryMap = {};
  categoryOptions.forEach((cat) => {
    categoryMap[cat.id] = cat;
  });

  useEffect(() => {
    console.log("Current filter value:", filter, typeof filter);
  }, [filter]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>

      <div className="space-y-3 mb-6">
        <input
          type="number"
          placeholder="Amount"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          value={formData.category || ""}
          onChange={(e) =>
            setFormData({ ...formData, category: parseInt(e.target.value) })
          }
        >
          {categoryOptions.length > 0 ? (
            categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))
          ) : (
            <option value="">Loading categories...</option>
          )}
        </select>

        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <button
          onClick={handleAddTransaction}
          disabled={loading}
          className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition disabled:bg-teal-300"
        >
          {loading ? "Adding..." : "Add Transaction"}
        </button>
      </div>

      <div className="space-y-4 mb-4">
        <div className="flex gap-4">
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="-date">Latest First</option>
            <option value="date">Oldest First</option>
            <option value="-amount">Highest Amount</option>
            <option value="amount">Lowest Amount</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Amount Range: ${minAmount} – ${maxAmount}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={5000}
              step={50}
              value={minAmount}
              onChange={(e) => {
                setMinAmount(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full"
            />
            <input
              type="range"
              min={0}
              max={10000}
              step={50}
              value={maxAmount}
              onChange={(e) => {
                setMaxAmount(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No transactions found</div>
      ) : (
        <ul className="space-y-3">
          {transactions.map((t, index) => {
            const cat = categoryMap[t.category];
            
            return (
              <li
                key={t.id || index}
                className="flex justify-between items-center bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat?.category_color || "#ccc" }}
                  ></span>
                  <span className="text-gray-700 font-medium">
                    {cat?.name || "Unknown"}
                  </span>
                </div>
                <div className={`${title === "Income" ? "text-green-600" : "text-red-600"} font-semibold`}> 
                  {title === "Income" ? "+" : "-"} Rs. {t.amount}
                </div>
                <div className="text-gray-400 text-xs">{t.date}</div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1 || loading}
          className={`px-3 py-1 rounded-md border ${
            currentPage === 1 || loading
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-teal-100 text-teal-600"
          }`}
        >
          ← Previous
        </button>

        <span>
          Page {currentPage} of {totalPages || 1}
        </span>

        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage >= totalPages || loading || totalPages === 0}
          className={`px-3 py-1 rounded-md border ${
            currentPage >= totalPages || loading || totalPages === 0
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-teal-100 text-teal-600"
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default function Transactions() {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setCategoriesLoading(true);
    setCategoriesError(null);

    fetch("http://127.0.0.1:8000/api/categories/", {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          setCategoriesLoading(false);
        } else {
          throw new Error("Invalid category response format");
        }
      })
      .catch((err) => {
        console.error("Category fetch error:", err);
        setCategoriesError(err.message);
        setCategoriesLoading(false);
        setCategories([]); 
      });
  }, []);

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  return (
    <motion.div
      key="dash"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-4"
    >
      {categoriesLoading ? (
        <div className="col-span-2 text-center py-8">Loading categories...</div>
      ) : categoriesError ? (
        <div className="col-span-2 text-center py-8 text-red-500">
          Error loading categories: {categoriesError}
        </div>
      ) : (
        <>
          <TransactionList
            title="Income"
            apiEndpoint="http://127.0.0.1:8000/api/incomes/"
            categoryOptions={incomeCategories}
          />
          <TransactionList
            title="Expenses"
            apiEndpoint="http://127.0.0.1:8000/api/expenses/"
            categoryOptions={expenseCategories}
          />
        </>
      )}
    </motion.div>
  );
}