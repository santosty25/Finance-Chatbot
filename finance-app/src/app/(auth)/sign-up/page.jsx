import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading sign-up...</div>}>
            <SignUp />
        </Suspense>
    );
}