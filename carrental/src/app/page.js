"use client";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    // Example authentication logic
    if (email === "admin@example.com" && password === "password123") {
      alert("Login successful!");
      // Redirect or further logic here
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
      <div className="bg-white/80 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-8 border border-gray-200">
        <div className="flex flex-col items-center">
          <img
            src="https://img.icons8.com/color/96/000000/car--v2.png"
            alt="Car Rental Logo"
            className="mb-4"
          />
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
            Welcome Back!
          </h2>
          <p className="text-gray-500 text-sm">Sign in to your car rental account</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <div className="text-red-600 text-center mb-2">{error}</div>
          )}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg font-bold shadow-lg hover:scale-105 transition-transform"
          >
            Sign In
          </button>
        </form>
        <div className="text-center text-sm text-gray-500 mt-2">
          <a href="#" className="text-blue-500 hover:underline">
            Forgot password?
          </a>
        </div>
      </div>
    </div>
  );
}