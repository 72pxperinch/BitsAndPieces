import React, { useState } from "react";
import { login, register } from "../services/Auth.js";
import { motion } from "framer-motion";

export default function Auth({ isLogin, toggleForm, setIsAuthenticated }) {

  return (
    <motion.div
      key={isLogin ? "login" : "register"}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-[80vh] flex flex-col items-center justify-center bg-white p-4 font-urbanist"
    >
      <div className="flex flex-col lg:flex-row items-center justify-evenly w-full max-w-8xl mt-10">
        <div className="flex flex-col items-center text-center lg:text-left mb-10 lg:mb-0 transition-transform duration-300 ease-in-out">
          <img
            src="/assets/logo.png"
            alt="Bits and Pieces Logo"
            className="w-35 sm:w-40 md:w-50 lg:w-72 max-w-full h-auto rounded-2xl"
          />
          <h1 className="text-6xl max-md:text-3xl max-lg:text-4xl font-bold mt-6">
            Bits and Pieces
          </h1>
          <p className="text-gray-600 mt-2">Your Personal Finance Buddy</p>
        </div>
        <div>
          {isLogin ? (
            <LoginForm
              onToggleForm={toggleForm}
              onLoginSuccess={() => setIsAuthenticated(true)}
            />
          ) : (
            <RegisterForm
              onToggleForm={toggleForm}
              onRegisterSuccess={() => setIsAuthenticated(true)}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function LoginForm({ onToggleForm, onLoginSuccess }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(form.username, form.password);
      localStorage.setItem("auth_token", response.token || "dummy_token");
      localStorage.setItem("username", form.username || "Unknown");
      onLoginSuccess?.();
    } catch (err) {
      alert("Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Login to your account.
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="input-field"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="input-field"
          required
        />
        <button
          type="submit"
          className="w-full bg-teal-700 text-white rounded-lg p-3 font-medium hover:bg-teal-800 transition"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600">
        Don’t have an account?{" "}
        <a
          onClick={(e) => {
            e.preventDefault();
            onToggleForm();
          }}
          className="text-teal-700 font-medium hover:underline cursor-pointer"
        >
          Sign Up
        </a>
      </p>
    </div>
  );
}

function RegisterForm({ onToggleForm, onRegisterSuccess }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await register(form.username, form.email, form.password);
      localStorage.setItem("auth_token", response.token || "dummy_token");
      localStorage.setItem("username", form.username || "Unknown");
      onRegisterSuccess?.();
    } catch (err) {
      alert("Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white space-y-4 p-6 rounded-xl shadow-lg my-10">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Hello! Enter your details to get started
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="input-field"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="input-field"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="input-field"
          required
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          className="input-field"
          required
        />
        <button
          type="submit"
          className="w-full bg-teal-700 text-white rounded-lg p-3 font-medium hover:bg-teal-800 transition"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <a
          onClick={(e) => {
            e.preventDefault();
            onToggleForm();
          }}
          className="text-teal-700 font-medium hover:underline cursor-pointer"
        >
          Login
        </a>
      </p>
    </div>
  );
}
