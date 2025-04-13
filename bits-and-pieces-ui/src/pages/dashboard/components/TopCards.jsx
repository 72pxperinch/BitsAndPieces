import React from "react";
import { motion } from "framer-motion";

export function BudgetStatusCard({ budget, expense }) {
    const difference = budget - expense;
    const status = difference >= 0 ? "within" : "exceeded";
  
    return (
      <motion.div
        key="dash"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4}}
        className="dashcard"
      >
        <h2 className="text-lg font-bold mb-2">Budget</h2>
        <p className="text-sm">
          {status === "within"
            ? `You are within budget by Rs.${difference.toFixed(2)}`
            : `You exceeded budget by Rs.${Math.abs(difference).toFixed(2)}`}
        </p>
        <div className="mt-2 h-2 bg-gray-300 rounded-full">
          <div
            className={`h-full rounded-full ${
              status === "within" ? "bg-green-500" : "bg-red-500"
            }`}
            style={{
              width: `${Math.min(Math.abs((expense / budget) * 100), 100)}%`,
            }}
          ></div>
        </div></motion.div>
    );
  };

  export  function MonthlyTotalsCard({ income, expense }) {
  const balance = income - expense;

  return (
    <motion.div
      key="budget"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 , delay: 0.1}}
      className="dashcard"
    >
      <h2 className="text-lg font-bold mb-2">
        This Month
      </h2>
      <div className="flex justify-evenly">
        <div>
          <p className="text-sm text-gray-600">Income</p>
          <p className="text-lg font-semibold text-green-600">
            Rs.{income.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Expense</p>
          <p className="text-lg font-semibold text-red-600">
            Rs.{expense.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Balance</p>
          <p className="text-lg font-semibold">Rs.{balance.toFixed(2)}</p>
        </div>
      </div>
    </motion.div>
  );
};

export  function OverallBalanceCard({ balance }) {
  return (
    <motion.div
      key="budget"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 , delay: 0.2}}
      className="dashcard"
    >
      <h2 className="text-lg font-bold mb-2">Overall Balance</h2>
      <p className="text-2xl font-bold text-blue-600">Rs.{balance.toFixed(2)}</p>
    </motion.div>
  );
};
