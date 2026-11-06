'use client';

import React, { useEffect }  from "react";
import SideNav from "./_components/SideNav";
import { Suspense } from "react";
import DashboardHeader from "./_components/DashboardHeader";
import { db } from "../../../../utils/dbConfig";
import { Budgets } from "../../../../utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { useRouter } from "next/navigation";

/*
layout.jsx - This represents the layout of the dashboard
*/
function DashboardLayout({ children }) {
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        user && checkUserBudgets()
    }, [user]);

    // This function checks whether the user has a budget in the database
    const checkUserBudgets = async () => {
        const result = await db.select.from(Budgets).where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress));
        if(result?.length === 0) {
            router.replace("/dashboard/budgets");
        }
    };

    return (
        <div>
            <div className="fixed md:w-64 hidden md:block">
                <Suspense fallback={<div>Loading navigation...</div>}>
                    <SideNav />
                </Suspense>
            </div>
            <div className="md:ml-64">
                <DashboardHeader/>
                {children}
            </div>
        </div>
    );
}

export default DashboardLayout;