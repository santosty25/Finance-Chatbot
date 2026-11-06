'use client';

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {Button} from "@/components/ui/button"; // button for navbar imported from shadcn
import { useUser, UserButton } from "@clerk/nextjs"; // for authentication

function Header() {
    const { user, isSignedIn } = useUser();
    return (
        <div className="p-5 flex justify-between items-center border shadow-small">
            <div className="flex flex-row items-center">
                <Image src={'/chart-donut.svg'} alt="logo" width={40} height={25}/>
                <span className="text-blue-800 font-bold text-xl">FinanSmart</span>
            </div>
            {isSignedIn ? (
                <UserButton/>
            ) : (
                <div className="flex gap-3 items-center">
                    <Link href="/dashboard">
                        <Button variant="outline" className="rounded-full">Dashboard</Button>
                    </Link>
                    <Link href="/sign-in">
                        <Button className="rounded-full">Get Started</Button>
                    </Link>
                </div>
            )}

        </div>
    ); 
}

export default Header;