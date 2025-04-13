import React from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

export default function Home({isOpen}) {
  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex items-start justify-between bg-white p-4 font-urbanist gap-5"
    >
      {isOpen ?
      <Sidebar />:''}
      <main className="flex-grow p-4">
        <Outlet />
      </main>
    </motion.div>
  );
}
