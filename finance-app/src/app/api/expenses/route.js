import { db } from "../../../../utils/dbConfig";
import { Budgets, Expenses } from "../../../../utils/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import moment from "moment";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const email = (await currentUser())?.primaryEmailAddress?.emailAddress;
    if (!email) return NextResponse.json({ error: "User email not found" }, { status: 400 });

    const budgetIdParam = new URL(request.url).searchParams.get("budgetId");
    const conditions = [eq(Budgets.createdBy, email)];

    if (budgetIdParam !== null) {
      const budgetId = Number(budgetIdParam);
      if (!Number.isInteger(budgetId)) {
        return NextResponse.json({ error: "Invalid budgetId" }, { status: 400 });
      }
      conditions.push(eq(Expenses.budgetId, budgetId));
    }

    const result = await db
      .select({
        id: Expenses.id,
        name: Expenses.name,
        amount: Expenses.amount,
        budgetId: Expenses.budgetId,
        createdAt: Expenses.createdAt,
      })
      .from(Expenses)
      .innerJoin(Budgets, eq(Expenses.budgetId, Budgets.id))
      .where(and(...conditions))
      .orderBy(desc(Expenses.id));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Expenses fetch error:", error);
    return NextResponse.json({ error: "Failed to load expenses" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const email = (await currentUser())?.primaryEmailAddress?.emailAddress;
    if (!email) return NextResponse.json({ error: "User email not found" }, { status: 400 });

    const { name, amount, budgetId } = await request.json();
    const budgetIdNum = Number(budgetId);

    if (!name || !amount || !Number.isInteger(budgetIdNum)) {
      return NextResponse.json({ error: "Name, amount and budget are required" }, { status: 400 });
    }

    // This makes sure the budget belongs to the signed-in user
    const owned = await db
      .select({ id: Budgets.id })
      .from(Budgets)
      .where(and(eq(Budgets.id, budgetIdNum), eq(Budgets.createdBy, email)));

    if (owned.length === 0) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    const result = await db
      .insert(Expenses)
      .values({
        name,
        amount: String(amount),
        budgetId: budgetIdNum,
        createdAt: moment().format("DD/MM/YYYY"),
      })
      .returning({ insertedId: Expenses.id });

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Expense insertion error:", error);
    return NextResponse.json({ error: "Failed to add expense" }, { status: 500 });
  }
}