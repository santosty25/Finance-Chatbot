'use client';

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import CardInfo from "./_components/CardInfo";
import { db } from "../../../../utils/dbConfig";
import { Budgets, Expenses, Incomes } from "../../../../utils/schema";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import BarChartDashboard from "./_components/BarChartDashboard";
import BudgetItem from "./budgets/_components/BudgetItem";
import ExpenseListTable from "./expenses/_components/ExpenseListTable";

function Dashboard () {
    const { user, isLoaded, isSignedIn } = useUser();
    const router = useRouter();
    const [budgetList, setBudgetList] = useState([]);
    const [incomeList, setIncomeList] = useState([]);
    const [expensesList, setExpensesList] = useState([]);

    useEffect(() => {
        if (!isLoaded) return;

        if (!isSignedIn) {
            router.replace("/sign-in");
            return;
        }

        if (user) {
            getBudgetList();
        }
    }, [user, isLoaded, isSignedIn, router]);

    // Wait until Clerk determines authentication status
    if (!isLoaded || !isSignedIn) {
        return <div className="p-8">Loading...</div>;
    }

    /*
    useEffect(() => {
        user && getBudgetList()
    }, [user]);
    */

    // Function to get the budget list from the database
    const getBudgetList = async () => {
        const result = await db
        .select({
            ...getTableColumns(Budgets),
            totalSpend: sql`sum(${Expenses.amount})`.mapWith(Number),
            totalItem: sql`count(${Expenses.id})`.mapWith(Number)

        })
        .from(Budgets)
        .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
        .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
        .groupBy(Budgets.id)
        .orderBy(desc(Budgets.id));

        setBudgetList(result);
        getAllExpenses();
        getIncomeList();
    };

    // Function to get all expenses from the user
    const getAllExpenses = async () => {
        const result = await db
        .select({
            id: Expenses.id,
            name: Expenses.name,
            amount: Expenses.amount,
            createdBy: Expenses.createdBy,
        })
        .from(Budgets)
        .rightJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
        .where(eq(Budgets.createdBy, user?.primaryEmailAddress.emailAddress))
        .orderBy(desc(Expenses.id));

        setExpensesList(result);

    };

    const getIncomeList = async () => {
        try{
            const result = await db
            .select({
                ...getTableColumns(Incomes),
                totalAmount: sql`sum(cast(${Incomes.amount} as numeric))`.mapWith(Number),
            })
            .from(Incomes)
            .groupBy(Incomes.id);

            setIncomeList(result);
        } catch (error) {
            console.error("Error fetching income list:", error);
        }
    };

    return (
    <div className="p-8">
        <h2 className="font-bold text-4xl">Hi, {user?.fullName}</h2>
        <p className="text-gray-500">Here's what is happening with your money. Let's manage your expenses</p>

        <CardInfo budgetList={budgetList} incomeList={incomeList}/>
        <div className="grid grid-cols-1 lg:grid-cols-3 mt-6 gap-5">
            <div className="lg:col-span-2">
                <BarChartDashboard budgetList={budgetList}/>
                <ExpenseListTable 
                    expensesList={expensesList} 
                    refreshData={() => getBudgetList()}
                />
            </div>
            <div className="grid gap-5">
                <h2 className="font-bold text-lg">Latest Budgets</h2>
                {budgetList?.length > 0 
                    ? budgetList.map((budget, index) => (
                       <BudgetItem budget={budget} key={index}/>
                )): [1, 2, 3, 4].map((item, index) => (
                    <div className="h-[180xp] w-full bg-slate-200 lg animate-pulse"></div>
                ))}
            </div>
        </div>
    </div>
    );
}

export default Dashboard;