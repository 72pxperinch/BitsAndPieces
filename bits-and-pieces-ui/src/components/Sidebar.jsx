import { NavLink } from "react-router-dom";
import { ChartPieIcon, CreditCardIcon, TagsIcon, HomeIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar({ isOpen }) {
  const username = localStorage.getItem("username");
  return (
    <motion.div
      key="budget"
      initial={{ opacity: 0, x: -200 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 200 }}
      transition={{ duration: 0.4 }}
      className="sidebar max-sm:absolute"
    >
      <div>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{username}</h2>
          <p className="text-sm text-gray-500 mt-1">Welcome!</p>
        </div>

        <nav className="flex flex-col space-y-6 mt-6">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `side-item ${
                isActive ? "font-bold text-gray-900" : "text-gray-600"
              }`
            }
          >
            <HomeIcon /> Dashboard
          </NavLink>
          <NavLink
            to="/budget"
            className={({ isActive }) =>
              `side-item ${
                isActive ? "font-bold text-gray-900" : "text-gray-600"
              }`
            }
          >
            <ChartPieIcon /> Budget
          </NavLink>
          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              `side-item ${
                isActive ? "font-bold text-gray-900" : "text-gray-600"
              }`
            }
          >
            <CreditCardIcon /> Transactions
          </NavLink>
          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `side-item ${
                isActive ? "font-bold text-gray-900" : "text-gray-600"
              }`
            }
          >
            <TagsIcon /> Categories
          </NavLink>
        </nav>
      </div>
      <div></div>
    </motion.div>
  );
}
