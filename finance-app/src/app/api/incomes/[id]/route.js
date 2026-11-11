import { db } from "../../../../../utils/dbConfig";
import { Incomes } from "../../../../../utils/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

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
    const incomeId = Number(id);
    if (!Number.isInteger(incomeId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    // Only delete rows owned by the signed-in user
    const deleted = await db
      .delete(Incomes)
      .where(and(eq(Incomes.id, incomeId), eq(Incomes.createdBy, email)))
      .returning({ deletedId: Incomes.id });

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Income not found" }, { status: 404 });
    }

    return NextResponse.json(deleted[0]);
  } catch (error) {
    console.error("Income delete error:", error);
    return NextResponse.json({ error: "Failed to delete income" }, { status: 500 });
  }
}