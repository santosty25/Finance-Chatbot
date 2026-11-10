'use client';

import React, { useEffect }  from "react";
import SideNav from "./_components/SideNav";
import { Suspense } from "react";
import DashboardHeader from "./_components/DashboardHeader";
import { useUser } from "@clerk/nextjs";
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
        try {
            const res = await fetch("/api/budgets");
            if (!res.ok) throw new Error("Failed to load budgets");

            const result = await res.json();
            if (result.length === 0) {
                router.replace("/dashboard/budgets");
            }
        } catch (error) {
            console.error("Error checking budgets:", error);
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