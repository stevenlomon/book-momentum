'use client'; // The only user interactive part of the Login Page. Needs to use `useState` and this it needs 'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // We use state variables for these rather than Loading.tsx and Error.tsx since we're dealing with form submissions. I will deep dive into this after the prototype is built
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success === "ok") {
        // Clear out the stale client-side router cache. Without this, the client-side router could think the now logged-in user is still an unauthenticated guest!
        router.refresh();

        // Navigate safely to the profile page
        router.push('/profile');
      } else {
        setError("Invalid username or password. Please try again."); // Security best practice: never give away which one is incorrect to any potential malicious user
      }
    } catch (err) {
      console.error("Unexpected login fetch error:", err);
      setError("Something went wrong. Check your connection and try again in a few moments.");
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder CSS, to be properly styled when I have a clear sense of the design of the app
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Username Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
      </div>

      {/* Password Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition disabled:bg-blue-400"
      >
        {isLoading ? "Logging in..." : "Log In"}
      </button>
    </form>
  )
};
