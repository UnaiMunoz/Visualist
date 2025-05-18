import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

const Navbar = () => {
  const { isLoggedIn, currentUser, loading, logout } = useAuth();
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  // Update username whenever currentUser changes
  useEffect(() => {
    if (currentUser && currentUser.name) {
      setUserName(currentUser.name);
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Visualist</Link>
      </div>

      <div className="navbar-nav">
        <Link to="/anime" className="nav-link">
          Anime
        </Link>
        <Link to="/movies" className="nav-link">
          Movies
        </Link>
        <Link to="/series" className="nav-link">
          Series
        </Link>
      </div>

      <div className="navbar-buttons">
        {loading ? (
          <div className="loading-spinner-small"></div>
        ) : isLoggedIn ? (
          <>
            <Link to="/profile" className="user-greeting">
              Hi, {userName || "User"}
            </Link>
            <button onClick={handleLogout} className="navbar-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              <button className="navbar-btn">Sign In</button>
            </Link>
            <Link to="/register">
              <button className="navbar-btn">Register</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
