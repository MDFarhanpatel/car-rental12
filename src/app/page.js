// "use client";
// import { useState } from "react";
// import{ useRouter } from "next/navigation";


// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//    const router = useRouter();

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setError("");
//     alert("Login successful!");
//     // Example authentication logic
//     if (email === "admin@example.com" && password === "password123") {
//     }  setError("");
//     // Replace with your authentication logic
//  router.push("/pages/home"); // Redirect to cars page on successful login
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-950 via-gray-900 to-fuchsia-900 font-sans">
//       <div className="bg-white/90 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-full max-w-md flex flex-col gap-8 border-2 border-cyan-300">
//         <div className="flex flex-col items-center">
//           <img
//             src="https://img.icons8.com/color/96/000000/car--v2.png"
//             alt="Car Rental Logo"
//             className="mb-4 animate-bounce"
//           />
//           <h2 className="text-4xl font-extrabold  text-black mb-2 text-center">
//              Car Rental Login
//           </h2>
//           <p className="text-black text-sm">Sign in to your account</p>
//         </div>
//         <form onSubmit={handleSubmit} className="flex flex-col gap-6">
//           {error && (
//             <div className="text-red-600 text-center mb-2">{error}</div>
//           )}
//           <div>
//             <label className="block mb-2 text-sm font-semibold text-black" htmlFor="email">
//               Email
//             </label>
//             <input
//               id="email"
//               type="email"
//               required
//               className="w-full px-4 py-2 border border-pink-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 transition text-black"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               autoComplete="email"
//               placeholder="you@example.com"
//             />
//           </div>
//           <div>
//             <label className="block mb-2 text-sm font-semibold text-black" htmlFor="password">
//               Password
//             </label>
//             <input
//               id="password"
//               type="password"
//               required
//               className="w-full px-4 py-2 border border-cyan-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition text-black"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               autoComplete="current-password"
//               placeholder="••••••••"
//             />
//           </div>
//           <button
//             type="submit"
//             className="bg-gradient-to-r from-gray-950 via-gray-900 to-fuchsia-900 text-white py-2 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform"
//           >
//             Sign In
//           </button>
//         </form>
//         <div className="text-center text-sm text-black mt-2">
//           <a href="#" className="text-cyan-500 hover:underline">
//             Forgot password?
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: emailOrUsername,
          password: password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        // No need to save token to localStorage; auth cookie is set by the API route
        router.push("/pages/home");
      } else {
        setError(data.message || "Login failed");
      }
    // } catch (error) {
    //   setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-950 via-gray-900 to-fuchsia-900 font-sans px-4 py-6 sm:px-6 lg:px-8">
      <div className="bg-white/90 backdrop-blur-lg p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md flex flex-col gap-6 sm:gap-8 border-2 border-cyan-300">
        <div className="flex flex-col items-center">
          <img
            src="https://img.icons8.com/color/96/000000/car--v2.png"
            alt="Car Rental Logo"
            className="mb-3 sm:mb-4 animate-bounce w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
          />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black mb-2 text-center leading-tight">
            Car Rental Login
          </h2>
          <p className="text-black text-xs sm:text-sm text-center">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-6">
          {error && (
            <div className="text-red-600 text-center mb-2 p-2 sm:p-3 bg-red-50 rounded-lg border border-red-200 text-sm">
              {error}
            </div>
          )}
          <div>
            <label
              className="block mb-2 text-sm font-semibold text-black"
              htmlFor="emailOrUsername"
            >
              Email or Username
            </label>
            <input
              id="emailOrUsername"
              type="text"
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-pink-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 transition text-black text-sm sm:text-base"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              autoComplete="username"
              placeholder="Enter your email or username"
            />
            <p className="text-xs text-gray-600 mt-1">
              You can use either your email address or username
            </p>
          </div>
          <div>
            <label
              className="block mb-2 text-sm font-semibold text-black"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-cyan-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition text-black text-sm sm:text-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`bg-gradient-to-r from-gray-950 via-gray-900 to-fuchsia-900 text-white py-2 sm:py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform text-sm sm:text-base ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <div className="text-center text-xs sm:text-sm text-black mt-2">
          <a href="#" className="text-cyan-500 hover:underline">
            Forgot password?
          </a>
        </div>
      </div>
    </div>
  );
}