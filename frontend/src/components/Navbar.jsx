import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

const Navbar = () => {
  const { isLoggedIn, currentUser, loading } = useAuth();
  const [userName, setUserName] = useState("");

  // Update username whenever currentUser changes
  useEffect(() => {
    if (currentUser && currentUser.name) {
      setUserName(currentUser.name);
    }
  }, [currentUser]);

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
          <Link to="/profile" className="user-greeting">
            Hi, {userName || "User"}
          </Link>
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
