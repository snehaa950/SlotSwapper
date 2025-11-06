import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import SwappableSlots from "./pages/SwappableSlots";
import SwapRequests from "./pages/SwapRequests"; // ✅ Added import

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if token exists on load
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    window.location.href = "/login"; // Redirect to login after logout
  };

  return (
    <Router>
      <div style={{ margin: "20px" }}>
        <h2>🕒 SlotSwapper</h2>

        <nav>
          {!isLoggedIn ? (
            <>
              <Link to="/signup">Signup</Link> | <Link to="/login">Login</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard">Dashboard</Link> |{" "}
              <Link to="/swappable-slots">Swappable Slots</Link> |{" "}
              <Link to="/swap-requests">Swap Requests</Link> |{" "}
              <button
                onClick={handleLogout}
                style={{
                  background: "none",
                  border: "none",
                  color: "blue",
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: "0",
                }}
              >
                Logout
              </button>
            </>
          )}
        </nav>

        <hr />

        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/login"
            element={<Login onLoginSuccess={() => setIsLoggedIn(true)} />}
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/swappable-slots" element={<SwappableSlots />} />
          <Route path="/swap-requests" element={<SwapRequests />} />{" "}
          {/* ✅ New Route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
