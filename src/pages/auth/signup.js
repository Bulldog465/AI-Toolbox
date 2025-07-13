import { useState } from "react";
import Link from "next/link"; // Import Link

export default function SignUp() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Sign Up Page (Coming Soon)</h2>

                <p className="mt-4 text-center text-gray-500 text-sm">
                    Already have an account?{" "}
                    <Link href="/auth/signin">
                        <a className="text-blue-500 hover:underline">Sign in</a>
                    </Link>
                </p>
            </div>
        </div>
    );
}
