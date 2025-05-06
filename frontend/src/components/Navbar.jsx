import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { checkSession, logout } from "../services/authServices";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifySession = async () => {
      try {
        const { isLoggedIn, user } = await checkSession();
        setIsLoggedIn(isLoggedIn);
        setUser(user);
      } catch (error) {
        console.error("Session verification error:", error);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      setUser(null);
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
            <span className="user-greeting">Hi, {user?.name || "User"}</span>
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
