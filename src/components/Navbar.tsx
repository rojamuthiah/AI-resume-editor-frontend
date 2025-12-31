import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { NavLogo } from "../assets/NavLogo";
import { Logo } from "../assets/AppLogo";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const isEditorPage = location.pathname.startsWith("/editor");

  const resumeBackUrl =
    location.state?.fromResumes || "/templates/categories";

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="w-full bg-white border-b">
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">

          {/* LEFT — LOGO */}
          <Link to="/templates/categories" className="flex items-center flex-shrink-0">
            <div className="flex items-center lg:hidden">
              <NavLogo variant="light" />
            </div>

            <div className="hidden lg:flex items-center">
              <div className="w-[180px]">
                <Logo variant="light" />
              </div>
            </div>
          </Link>

          {/* RIGHT — NAV + AVATAR */}
          <div className="flex items-center gap-6">

            {/* NAV LINKS */}
            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link
                to="/home"
                className={`hover:text-black whitespace-nowrap ${
                  location.pathname === "/home"
                    ? "text-black"
                    : "text-gray-500"
                }`}
              >
                Home
              </Link>

              {isEditorPage ? (
                <button
                  onClick={() => navigate(resumeBackUrl)}
                  className="text-blue-600 hover:underline whitespace-nowrap"
                >
                  ← Resumes
                </button>
              ) : (
                <Link
                  to="/templates/categories"
                  className={`hover:text-black whitespace-nowrap ${
                    location.pathname.startsWith("/templates")
                      ? "text-black"
                      : "text-gray-500"
                  }`}
                >
                  Templates
                </Link>
              )}
            </nav>

            {/* AVATAR + DROPDOWN */}
            {user && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setOpen(!open)}
                  className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center"
                >
                  {user.name?.charAt(0).toUpperCase()}
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border shadow-lg rounded-md overflow-hidden">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      {user.name}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
