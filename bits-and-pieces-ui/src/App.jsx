import "./App.css";
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Auth from "./screens/Auth";
import Home from "./screens/Home";
import Dashboard from "./pages/dashboard/Dashboard";
import Budget from "./pages/budget/Budget";
import Transactions from "./pages/transactions/Transactions";
import Categories from "./pages/categories/Categories";

function App() {
  const [isOpen, setIsOpen] = useState(() => window.innerWidth > 768);

  const [isLogin, setIsLogin] = useState(false);
  const toggleForm = () => setIsLogin((prev) => !prev);
  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Navbar
        isLogin={isLogin}
        onToggleForm={toggleForm}
        isAuthenticated={isAuthenticated}
        handleLogout={handleLogout}
        onMenuClick={toggleSidebar}
      />

      <Routes>
        {!isAuthenticated ? (
          <Route
            path="*"
            element={
              <Auth
                isLogin={isLogin}
                toggleForm={toggleForm}
                setIsAuthenticated={setIsAuthenticated}
              />
            }
          />
        ) : (
          <>
            <Route path="/" element={<Home isOpen={isOpen} />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="budget" element={<Budget />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="categories" element={<Categories />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </>
        )}
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
