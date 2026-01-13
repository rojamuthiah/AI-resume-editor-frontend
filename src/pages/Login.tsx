import { useState, useContext } from "react";
import { loginUser } from "../api/auth";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Logo } from "../assets/AppLogo";

function isMobilePhone() {
  return window.innerWidth < 768; // phones only
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [loginAllowed, setLoginAllowed] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const res = await loginUser(form);
      login(res.user);

      if (isMobilePhone()) {
        setShowDisclaimer(true);
      } else {
        navigate("/home");
      }
    } catch {
      setError("Invalid email or password");
    }
  }

  function handleContinue() {
    setShowDisclaimer(false);
    setLoginAllowed(true);
    navigate("/home");
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* LEFT BRANDING */}
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

        {/* LOGIN CARD */}
        <div className="flex justify-center mt-10 lg:mt-0 lg:min-h-screen lg:items-center">
          <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-6">
              Login
            </h2>

            {error && (
              <p className="text-red-600 text-center mb-4">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="font-medium text-gray-700">
                  Email
                </label>
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
                <label className="font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
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
                Login
              </button>
            </form>

            <p className="text-center mt-4 text-sm">
              Don’t have an account?{" "}
              <Link to="/signup" className="font-medium text-black">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* DISCLAIMER MODAL */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 text-center">
            <h3 className="text-xl font-bold mb-3">
              Limited Mobile Experience
            </h3>

            <p className="text-gray-600 text-sm mb-6">
              Some features are limited on mobile phones.
              <br /><br />
              PDF preview is not supported.
              <br />
              For the best experience, please use a laptop or tablet.
            </p>

            <button
              onClick={handleContinue}
              className="w-full bg-black text-white py-3 rounded-lg hover:opacity-90 transition"
            >
              Continue Anyway
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
