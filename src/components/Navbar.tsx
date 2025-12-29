import { Link, useLocation } from "react-router-dom";
import { NavLogo } from "../assets/NavLogo";
import { Logo } from "../assets/Logo";

const Navbar = () => {
  const location = useLocation();

  return (
    <header className="w-full bg-white border-b">
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">

          {/* LEFT — LOGO */}
          <Link to="/templates/categories" className="flex items-center flex-shrink-0">

            {/* MOBILE + TABLET */}
            <div className="flex items-center lg:hidden">
              <NavLogo variant="light" />
            </div>

            {/* LAPTOP + DESKTOP */}
            <div className="hidden lg:flex items-center">
              <div className="w-[180px]">
                <Logo variant="light" />
              </div>
            </div>

          </Link>

          {/* RIGHT — NAV LINKS */}
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

            <Link
              to="/templates/categories"
              className={`hover:text-black whitespace-nowrap ${
                location.pathname === "/templates/categories" || location.pathname === "/templates"
                  ? "text-black"
                  : "text-gray-500"
              }`}
            >
              Templates
            </Link>
          </nav>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
