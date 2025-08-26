"use client";
import { useState } from "react";
import{ useRouter } from "next/navigation";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
   const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    alert("Login successful!");
    // Example authentication logic
    if (email === "admin@example.com" && password === "password123") {
    }  setError("");
    // Replace with your authentication logic
 router.push("/pages/users"); // Redirect to cars page on successful login
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-200 via-pink-200 to-yellow-200">
      <div className="bg-white/90 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-full max-w-md flex flex-col gap-8 border-2 border-cyan-300">
        <div className="flex flex-col items-center">
          <img
            src="https://img.icons8.com/color/96/000000/car--v2.png"
            alt="Car Rental Logo"
            className="mb-4 animate-bounce"
          />
          <h2 className="text-4xl font-extrabold  text-black mb-2 text-center">
             Car Rental Login
          </h2>
          <p className="text-black text-sm">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <div className="text-red-600 text-center mb-2">{error}</div>
          )}
          <div>
            <label className="block mb-2 text-sm font-semibold text-black" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-4 py-2 border border-pink-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 transition text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-black" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full px-4 py-2 border border-cyan-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400 text-black py-2 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform"
          >
            Sign In
          </button>
        </form>
        <div className="text-center text-sm text-black mt-2">
          <a href="#" className="text-cyan-500 hover:underline">
            Forgot password?
          </a>
        </div>
      </div>
    </div>
  );
}