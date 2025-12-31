import { useState } from "react";
import { registerUser } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";
import { Logo } from "../assets/AppLogo";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* DESKTOP LEFT BRANDING */}
      <div className="hidden lg:flex bg-black text-white flex-col justify-center px-20">
        <div className="max-w-md">
          <div className="w-[320px] mb-10">
            <Logo variant="dark" />
          </div>

          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Create, refine and optimize your resume using AI.
          </h2>

          <p className="text-gray-300 text-lg">
            Write clearer, stronger resumes with intelligent suggestions.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="bg-black min-h-screen px-4">

        {/* MOBILE HEADER */}
        <div className="lg:hidden w-full bg-black px-4 pt-6 pb-8">
          <div className="max-w-md mx-auto">
            <div className="w-[200px]">
              <Logo variant="dark" />
            </div>

            <p className="mt-3 text-sm text-gray-300">
              Create, refine and optimize your resume using AI.
            </p>
          </div>
        </div>

        {/* CARD WRAPPER */}
        <div className="flex justify-center mt-10 lg:mt-0 lg:min-h-screen lg:items-center">
          <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-6">
              Create Account
            </h2>

            {error && (
              <p className="text-red-600 text-center mb-4">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="name"
                  onChange={handleChange}
                  className="mt-2 w-full p-3 border rounded-lg focus:ring-2 focus:ring-black"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  onChange={handleChange}
                  className="mt-2 w-full p-3 border rounded-lg focus:ring-2 focus:ring-black"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  onChange={handleChange}
                  className="mt-2 w-full p-3 border rounded-lg focus:ring-2 focus:ring-black"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-lg hover:opacity-90 transition"
              >
                Sign Up
              </button>
            </form>

            <p className="text-center mt-4 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-black">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
