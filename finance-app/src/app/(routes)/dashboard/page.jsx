'use client';

import React, { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import CardInfo from "./_components/CardInfo";
import BarChartDashboard from "./_components/BarChartDashboard";
import BudgetItem from "./budgets/_components/BudgetItem";
import ExpenseListTable from "./expenses/_components/ExpenseListTable";

function Dashboard() {
    const { user, isLoaded, isSignedIn } = useUser();
    const router = useRouter();
    const [budgetList, setBudgetList] = useState([]);
    const [incomeList, setIncomeList] = useState([]);
    const [expensesList, setExpensesList] = useState([]);

    // Loads budgets, expenses, and incomes from the API
    const loadData = useCallback(async () => {
        try {
            const [budgetsRes, expensesRes, incomesRes] = await Promise.all([
                fetch("/api/budgets"),
                fetch("/api/expenses"),
                fetch("/api/incomes"),
            ]);

            if (budgetsRes.ok) setBudgetList(await budgetsRes.json());
            if (expensesRes.ok) setExpensesList(await expensesRes.json());
            if (incomesRes.ok) setIncomeList(await incomesRes.json());
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        }
    }, []);

    useEffect(() => {
        if (!isLoaded) return;

        if (!isSignedIn) {
            router.replace("/sign-in");
            return;
        }

        loadData();
    }, [isLoaded, isSignedIn, router, loadData]);

    if (!isLoaded || !isSignedIn) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="p-8">
            <h2 className="font-bold text-4xl">Hi, {user?.fullName}</h2>
            <p className="text-gray-500">
                Here's what is happening with your money. Let's manage your expenses
            </p>

            <CardInfo budgetList={budgetList} incomeList={incomeList} />
            <div className="grid grid-cols-1 lg:grid-cols-3 mt-6 gap-5">
                <div className="lg:col-span-2">
                    <BarChartDashboard budgetList={budgetList} />
                    <ExpenseListTable
                        expensesList={expensesList}
                        refreshData={loadData}
                    />
                </div>
                <div className="grid gap-5">
                    <h2 className="font-bold text-lg">Latest Budgets</h2>
                    {budgetList?.length > 0
                        ? budgetList.map((budget) => (
                              <BudgetItem budget={budget} key={budget.id} />
                          ))
                        : [1, 2, 3, 4].map((item) => (
                              <div
                                  key={item}
                                  className="h-[180px] w-full bg-slate-200 rounded-lg animate-pulse"
                              ></div>
                          ))}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;