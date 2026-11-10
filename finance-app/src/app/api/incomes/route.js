import { db } from "../../../../utils/dbConfig";
import { Incomes } from "../../../../utils/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq, desc, getTableColumns, sql } from "drizzle-orm";

export async function POST(request) {

    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = await currentUser();
        const email = user?.primaryEmailAddress?.emailAddress;

        if (!email) {
            return NextResponse.json(
                { error: "User email not found" },
                { status: 400 }
            );
        }

        const { name, amount, icon } = await request.json();

        if (!name || !amount) {
            return NextResponse.json(
                { error: "Name and amount are required" },
                { status: 400 }
            );
        }

        const result = await db
            .insert(Incomes)
            .values({
                name,
                amount: String(amount),
                createdBy: email,
                icon,
            })
            .returning({ insertedId: Incomes.id });

        return NextResponse.json(result[0]);

    } catch (error) {
        console.error("Income insertion error:", error);

        return NextResponse.json(
            {
                error: "Failed to create income source",
                detail: String(error?.cause?.message || error?.message),
            },
            { status: 500 }
        );
    }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const email = (await currentUser())?.primaryEmailAddress?.emailAddress;
    if (!email) return NextResponse.json({ error: "User email not found" }, { status: 400 });

    const result = await db
      .select({
        ...getTableColumns(Incomes),
        totalAmount: sql`cast(${Incomes.amount} as numeric)`.mapWith(Number),
      })
      .from(Incomes)
      .where(eq(Incomes.createdBy, email))
      .orderBy(desc(Incomes.id));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Income fetch error:", error);
    return NextResponse.json({ error: "Failed to load incomes" }, { status: 500 });
  }
}
