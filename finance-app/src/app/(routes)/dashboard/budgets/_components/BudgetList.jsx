"use client";

import React, { useCallback, useEffect, useState } from "react";
import CreateBudget from "./CreateBudget";
import { useUser } from "@clerk/nextjs";
import BudgetItem from "./BudgetItem";

function BudgetList() {
  const [budgetList, setBudgetList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  // Get the budget list from the API
  const getBudgetList = useCallback(async () => {
    try {
      const res = await fetch("/api/budgets");
      if (!res.ok) throw new Error("Failed to load budgets");
      setBudgetList(await res.json());
    } catch (error) {
      console.error("Error loading budgets:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) getBudgetList();
  }, [user, getBudgetList]);

  return (
    <div className="mt-7">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <CreateBudget refreshData={getBudgetList} />
        {loading
          ? [1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="w-full bg-slate-200 rounded-lg h-[150px] animate-pulse"
              ></div>
            ))
          : budgetList.map((budget) => (
              <BudgetItem budget={budget} key={budget.id} refreshData={getBudgetList}/>
            ))}
      </div>
    </div>
  );
}

export default BudgetList;