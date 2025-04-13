import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import dayjs from "dayjs"; 

export default function CategoryList({
  isReadOnly,
  categories,
  onCategoryUpdate,
  availableCategories,
  onAddCategory,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const [categoryDetails, setCategoryDetails] = useState({});
  const [token, setToken] = useState(() => localStorage.getItem("auth_token") || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/categories/`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const lookupDetails = data.reduce((acc, category) => {
            acc[category.id] = {
              name: category.name,
              color: category.category_color
            };
            return acc;
          }, {});
          setCategoryDetails(lookupDetails);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch category details:", err);
        setLoading(false);
      });
  }, [token]);

  const currentMonthIndex = new Date().getMonth(); 

  const filteredCategories = categories.filter((category) => {
    if (category.month) {
      const categoryMonth = dayjs(category.month).month(); 
      return categoryMonth === currentMonthIndex;
    }
    return true;
  });

  const formatDate = (date) => {
    if (!date) return ""; 
    return dayjs(date).format("MMMM D, YYYY"); 
  };

  const getCategoryName = (category) => {
    if (categoryDetails[category.id]) {
      return categoryDetails[category.id].name;
    }
    return category.name;
  };

  const getCategoryColor = (category) => {
    if (categoryDetails[category.id]) {
      return categoryDetails[category.id].color || "#cccccc"; 
    }
    return "#cccccc"; 
  };

  const remainingCategories = availableCategories.filter(
    (category) => !categories.some((c) => c.name === category)
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <motion.div
      key="budget"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-white rounded-xl shadow-md p-6 overflow-y-auto"
    >
      <h2 className="text-lg font-bold mb-4 text-gray-800">Category Budgets</h2>
      <div className="space-y-3 mb-6">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <div
              key={category.id}
              className="flex justify-between items-center bg-gray-100 p-3 rounded-lg"
            >
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-3" 
                  style={{ backgroundColor: getCategoryColor(category) }}
                ></div>
                
                <div className="flex flex-col">
                  <span className="font-medium text-gray-700">{getCategoryName(category)}</span>
                  {category.month && (
                    <span className="text-sm text-gray-500">
                      {formatDate(category.month)}
                    </span>
                  )}
                </div>
              </div>

              {editingId === category.id ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-24 border border-gray-300 rounded-lg px-2 py-1"
                  />
                  <button
                    onClick={() => {
                      const numValue = parseFloat(editValue);
                      if (!isNaN(numValue)) {
                        onCategoryUpdate(category.id, numValue);
                        setEditingId(null);
                      }
                    }}
                    className="px-3 py-1 bg-teal-700 text-white rounded hover:bg-teal-900"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700">Rs.{category.budget}</span>
                  {!isReadOnly && (
                    <button
                      onClick={() => {
                        setEditingId(category.id);
                        setEditValue(category.budget.toString());
                      }}
                      className="px-3 py-1 bg-teal-700 text-white rounded hover:bg-teal-900"
                    >
                      Edit
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No categories for this month</p>
        )}
      </div>

      {!isReadOnly && (
        <div className="mt-4">
          <h3 className="font-semibold text-gray-700 mb-2">Add Category</h3>
          <div className="flex flex-col space-y-2">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select Category</option>
              {remainingCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                placeholder="Budget Amount"
                className="flex-grow border border-gray-300 rounded-lg px-3 py-2"
              />
              <button
                onClick={() => {
                  const budget = parseFloat(newBudget);
                  if (!isNaN(budget) && newCategory) {
                    onAddCategory(newCategory, budget);
                    setNewCategory("");
                    setNewBudget("");
                  }
                }}
                disabled={!newCategory || !newBudget}
                className="px-4 py-2 bg-teal-700 text-white rounded hover:bg-teal-900 disabled:opacity-40"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}