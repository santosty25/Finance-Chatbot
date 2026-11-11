"use client";
import React, { useCallback, useEffect, useState } from "react";
import ExpenseListTable from "./_components/ExpenseListTable";
import { useUser } from "@clerk/nextjs";

function ExpensesScreen() {
  const [expensesList, setExpensesList] = useState([]);
  const { user } = useUser();

  // Gets all expenses that belong to the user
  const getAllExpenses = useCallback(async () => {
    try {
      const res = await fetch("/api/expenses");
      if (!res.ok) throw new Error("Failed to load expenses");
      setExpensesList(await res.json());
    } catch (error) {
      console.error("Error loading expenses:", error);
    }
  }, []);

  useEffect(() => {
    if (user) getAllExpenses();
  }, [user, getAllExpenses]);

  return (
    <div className="p-10">
      <h2 className="font-bold text-3xl">My Expenses</h2>

      <ExpenseListTable
        refreshData={getAllExpenses}
        expensesList={expensesList}
      />
    </div>
  );
}

export default ExpensesScreen;