"use client";

import React, { useCallback, useEffect, useState } from "react";
import CreateIncomes from "./CreateIncomes";
import { useUser } from "@clerk/nextjs";
import IncomeItem from "./IncomeItem";

function IncomeList() {
  const [incomelist, setIncomelist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const totalIncome = incomelist.reduce(
  (sum, income) => sum + Number(income.amount || 0),
  0
  );

  const getIncomelist = useCallback(async () => {
    try {
      const res = await fetch("/api/incomes");
      if (!res.ok) throw new Error("Failed to load incomes");
      setIncomelist(await res.json());
    } catch (error) {
      console.error("Error loading incomes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) getIncomelist();
  }, [user, getIncomelist]);

  return (
    <div className="mt-7">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <CreateIncomes refreshData={getIncomelist} />
        {loading
          ? [1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="w-full bg-slate-200 rounded-lg h-[150px] animate-pulse"
              ></div>
            ))
          : incomelist.map((income) => (
            <IncomeItem
              budget={income}
              key={income.id}
              refreshData={getIncomelist}
              totalIncome={totalIncome}
            />
          ))}
      </div>
    </div>
  );
}

export default IncomeList;