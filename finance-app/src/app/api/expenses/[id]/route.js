import { db } from "../../../../../utils/dbConfig";
import { Budgets, Expenses } from "../../../../../utils/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { and, eq, getTableColumns, sql } from "drizzle-orm";

export async function DELETE(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = (await currentUser())?.primaryEmailAddress?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    const { id } = await params;
    const expenseId = Number(id);
    if (!Number.isInteger(expenseId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    // Ownership goes through the budget the expense belongs to
    const owned = await db
      .select({ id: Expenses.id })
      .from(Expenses)
      .innerJoin(Budgets, eq(Expenses.budgetId, Budgets.id))
      .where(and(eq(Expenses.id, expenseId), eq(Budgets.createdBy, email)));

    if (owned.length === 0) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    await db.delete(Expenses).where(eq(Expenses.id, expenseId));

    return NextResponse.json({ deletedId: expenseId });
  } catch (error) {
    console.error("Expense delete error:", error);
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const email = (await currentUser())?.primaryEmailAddress?.emailAddress;
    if (!email) return NextResponse.json({ error: "User email not found" }, { status: 400 });

    const { id } = await params;
    const budgetId = Number(id);
    if (!Number.isInteger(budgetId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const result = await db
      .select({
        ...getTableColumns(Budgets),
        totalSpend: sql`sum(cast(${Expenses.amount} as numeric))`.mapWith(Number),
        totalItem: sql`count(${Expenses.id})`.mapWith(Number),
      })
      .from(Budgets)
      .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
      .where(and(eq(Budgets.id, budgetId), eq(Budgets.createdBy, email)))
      .groupBy(Budgets.id);

    if (result.length === 0) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Budget fetch error:", error);
    return NextResponse.json({ error: "Failed to load budget" }, { status: 500 });
  }
}