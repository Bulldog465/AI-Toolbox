import { useState } from 'react';

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Simple validation for matching passwords
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Logic for sign-up (e.g., make API request to register the user)
        try {
            // Replace with your sign-up logic, like an API call
            console.log('User signed up with email:', email);
            // Clear the form after successful signup
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setError('');
        } catch (err) {
            setError('Failed to sign up');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Sign Up</h2>

                {/* Display error message if there's any */}
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                <form onSubmit={handleSubmit}>
                    {/* Email Input */}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm text-gray-600">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="w-full p-3 mt-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm text-gray-600">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="w-full p-3 mt-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Confirm Password Input */}
                    <div className="mb-4">
                        <label htmlFor="confirmPassword" className="block text-sm text-gray-600">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="w-full p-3 mt-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="mb-4">
                        <button
                            type="submit"
                            className="w-full px-4 py-2 text-white bg-blue-600 rounded-xl hover:bg-blue-700"
                        >
                            Sign Up
                        </button>
                    </div>
                </form>

                <p className="mt-4 text-center text-gray-500 text-sm">
                    Already have an account? <a href="/auth/signin" className="text-blue-500 hover:underline">Sign in</a>
                </p>
            </div>
        </div>
    );
}
