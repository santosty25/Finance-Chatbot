import { db } from "../../../../utils/dbConfig";
import { Budgets, Expenses } from "../../../../utils/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const email = (await currentUser())?.primaryEmailAddress?.emailAddress;
    if (!email) return NextResponse.json({ error: "User email not found" }, { status: 400 });

    const result = await db
      .select({
        ...getTableColumns(Budgets),
        totalSpend: sql`sum(${Expenses.amount})`.mapWith(Number),
        totalItem: sql`count(${Expenses.id})`.mapWith(Number),
      })
      .from(Budgets)
      .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
      .where(eq(Budgets.createdBy, email))
      .groupBy(Budgets.id)
      .orderBy(desc(Budgets.id));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Budget fetch error:", error);
    return NextResponse.json({ error: "Failed to load budgets" }, { status: 500 });
  }
}