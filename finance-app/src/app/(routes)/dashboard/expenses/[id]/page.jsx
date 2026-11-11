"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import BudgetItem from "../../budgets/_components/BudgetItem";
import AddExpense from "../_components/AddExpense";
import ExpenseListTable from "../_components/ExpenseListTable";
import EditBudget from "../_components/EditBudget";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

function ExpensesScreen() {
  const { id } = useParams();
  const { user } = useUser();
  const router = useRouter();
  const [budgetInfo, setBudgetInfo] = useState();
  const [expensesList, setExpensesList] = useState([]);

  // Loads the budget and its expenses
  const loadData = useCallback(async () => {
    try {
      const [budgetRes, expensesRes] = await Promise.all([
        fetch(`/api/budgets/${id}`),
        fetch(`/api/expenses?budgetId=${id}`),
      ]);

      if (budgetRes.status === 404) {
        toast.error("Budget not found");
        router.replace("/dashboard/budgets");
        return;
      }
      if (!budgetRes.ok || !expensesRes.ok) throw new Error("Failed to load data");

      setBudgetInfo(await budgetRes.json());
      setExpensesList(await expensesRes.json());
    } catch (error) {
      console.error("Error loading budget page:", error);
    }
  }, [id, router]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  // Deletes the budget and its expenses
  const deleteBudget = async () => {
    try {
      const res = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);

      toast.success("Budget Deleted!");
      router.replace("/dashboard/budgets");
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast.error(error.message || "Failed to delete budget.");
    }
  };

  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold gap-2 flex justify-between items-center">
        <span className="flex gap-2 items-center">
          <ArrowLeft onClick={() => router.back()} className="cursor-pointer" />
          My Expenses
        </span>
        <div className="flex gap-2 items-center">
          <EditBudget budgetInfo={budgetInfo} refreshData={loadData} />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="flex gap-2 rounded-full" variant="destructive">
                <Trash className="w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your current budget along with its expenses.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteBudget}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 mt-6 gap-5">
        {budgetInfo ? (
          <BudgetItem budget={budgetInfo} />
        ) : (
          <div className="h-[150px] w-full bg-slate-200 rounded-lg animate-pulse"></div>
        )}
        <AddExpense budgetId={id} refreshData={loadData} />
      </div>

      <div className="mt-4">
        <ExpenseListTable expensesList={expensesList} refreshData={loadData} />
      </div>
    </div>
  );
}

export default ExpensesScreen;