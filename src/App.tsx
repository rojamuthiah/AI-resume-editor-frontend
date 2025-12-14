import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TemplatesPage from "./pages/TemplatePage";
import EditorPage from "./pages/EditorPage"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root → login */}
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* After login user lands here */}
        <Route path="/templates" element={<TemplatesPage />} />

        {/* Resume editor (supports query params like ?template=classic) */}
        <Route path="/editor" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
