import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CategoryPage from "./pages/CategoryPage";
import TemplatePage from "./pages/TemplatePage";
import EditorPage from "./pages/EditorPage";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";

/* Layout wrapper to conditionally show Navbar */
function AppLayout() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/editor";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Redirect root → login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* App pages */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/templates/categories" element={<CategoryPage />} />
        <Route path="/templates" element={<TemplatePage />} />
        <Route path="/editor" element={<EditorPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;