import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

function CategoryManager({ title, categoryType }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newColor, setNewColor] = useState("#4F46E5");

  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const [editColor, setEditColor] = useState("#4F46E5");

  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("auth_token");

  useEffect(() => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/api/categories/?type=${categoryType}`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch categories:", err);
        setLoading(false);
      });
  }, [categoryType]);

  const handleAdd = () => {
    if (!newCategory.trim()) return;

    fetch("http://127.0.0.1:8000/api/categories/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        name: newCategory.trim(),
        category_color: newColor,
        type: categoryType,
      }),
    })
      .then((res) => res.json())
      .then((newCat) => {
        setCategories([...categories, newCat]);
        setNewCategory("");
        setNewColor("#4F46E5");
      })
      .catch((err) => console.error("Add category error:", err));
  };

  const handleDelete = (id) => {
    fetch(`http://127.0.0.1:8000/api/categories/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Token ${token}` },
    })
      .then(() => {
        setCategories(categories.filter((c) => c.id !== id));
      })
      .catch((err) => console.error("Delete error:", err));
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditText(categories[index].name);
    setEditColor(categories[index].category_color);
  };

  const handleSaveEdit = () => {
    const cat = categories[editingIndex];
    if (!editText.trim()) return;

    fetch(`http://127.0.0.1:8000/api/categories/${cat.id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        name: editText.trim(),
        category_color: editColor,
      }),
    })
      .then((res) => res.json())
      .then((updated) => {
        const updatedList = [...categories];
        updatedList[editingIndex] = updated;
        setCategories(updatedList);
        setEditingIndex(null);
      })
      .catch((err) => console.error("Update error:", err));
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>

      <div className="flex gap-2 mb-4 items-center">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          className="w-10 h-10 p-1 border rounded-lg"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Add
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        <ul className="space-y-3">
          {categories.map((category, index) => (
            <li
              key={category.id}
              className="flex justify-between items-center bg-white rounded-xl border border-gray-200 px-4 py-2 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-2 flex-1">
                <span
                  className="w-4 h-4 rounded-full inline-block"
                  style={{ backgroundColor: category.category_color }}
                ></span>

                {editingIndex === index ? (
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                ) : (
                  <span className="text-gray-700">{category.name}</span>
                )}
              </div>

              {editingIndex === index ? (
                <>
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-8 h-8 p-1 mr-2"
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="text-green-600 text-sm hover:underline mr-2"
                  >
                    Save
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleEdit(index)}
                  className="text-blue-600 text-sm hover:underline mr-2"
                >
                  Edit
                </button>
              )}

              <button
                onClick={() => handleDelete(category.id)}
                className="text-red-500 text-sm hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
export default function Category() {
  return (
    <motion.div
      key="categories"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <CategoryManager title="Income Categories" categoryType="income" />
      <CategoryManager title="Expense Categories" categoryType="expense" />
    </motion.div>
  );
}
