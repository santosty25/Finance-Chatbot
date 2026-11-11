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
    const budgetId = Number(id);
    if (!Number.isInteger(budgetId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    // Confirm the budget belongs to the signed-in user
    const owned = await db
      .select({ id: Budgets.id })
      .from(Budgets)
      .where(and(eq(Budgets.id, budgetId), eq(Budgets.createdBy, email)));

    if (owned.length === 0) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    // Delete the budget's expenses first, then the budget, in one batch
    await db.batch([
      db.delete(Expenses).where(eq(Expenses.budgetId, budgetId)),
      db.delete(Budgets).where(
        and(eq(Budgets.id, budgetId), eq(Budgets.createdBy, email))
      ),
    ]);

    return NextResponse.json({ deletedId: budgetId });
  } catch (error) {
    console.error("Budget delete error:", error);
    return NextResponse.json({ error: "Failed to delete budget" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
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
    const budgetId = Number(id);
    if (!Number.isInteger(budgetId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const { name, amount, icon } = await request.json();
    if (!name || !amount) {
      return NextResponse.json({ error: "Name and amount are required" }, { status: 400 });
    }

    // The createdBy check means users can only edit their own budgets
    const updated = await db
      .update(Budgets)
      .set({ name, amount: String(amount), icon })
      .where(and(eq(Budgets.id, budgetId), eq(Budgets.createdBy, email)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Budget update error:", error);
    return NextResponse.json({ error: "Failed to update budget" }, { status: 500 });
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