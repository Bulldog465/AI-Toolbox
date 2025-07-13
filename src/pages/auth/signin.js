import { getProviders, signIn } from "next-auth/react";
import Link from "next/link"; // Import Link

export default function SignIn({ providers }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Welcome Back</h2>

                {Object.values(providers).map((provider) => (
                    <div key={provider.name} className="mb-4">
                        <button
                            onClick={() => signIn(provider.id)}
                            className="w-full px-4 py-2 text-white bg-blue-600 rounded-xl hover:bg-blue-700"
                        >
                            Sign in with {provider.name}
                        </button>
                    </div>
                ))}

                <p className="mt-4 text-center text-gray-500 text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/signup">
                        <a className="text-blue-500 hover:underline">Sign up</a>
                    </Link>
                </p>
            </div>
        </div>
    );
}

export async function getServerSideProps() {
    const providers = await getProviders();
    return {
        props: { providers },
    };
}
