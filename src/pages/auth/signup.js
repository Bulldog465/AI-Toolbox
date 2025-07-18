import Link from "next/link";
import Meta from '@/components/Meta/index'; // Added Meta import

export default function SignUp() {
    return (
        <>
            <Meta
                title="Sign Up | AI Toolbox™ - Simplify Workflows & Accelerate Growth"
                description="Sign up for AI Toolbox to streamline your workflows, automate business tasks, and accelerate growth with AI-driven solutions."
            />

            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
                    <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
                        Create Your AI Toolbox™ Account (Coming Soon)
                    </h2>

                    <p className="mt-4 text-center text-gray-500 text-sm">
                        Already have an account?{" "}
                        <Link href="/auth/signin" className="text-blue-500 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}
