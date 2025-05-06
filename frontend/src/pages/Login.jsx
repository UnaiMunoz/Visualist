import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/authServices";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!email || !password) {
      setErrorMessage("Email and password are required");
      return;
    }

    // Set loading state
    setLoading(true);

    try {
      // Login user
      const response = await login({ email, password, remember: rememberMe });

      if (response.success) {
        // Update auth context
        authLogin(response.user);
        // Navigate to home page
        navigate("/");
      } else {
        // Show error message
        setErrorMessage(response.message || "Invalid email or password");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again later.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group form-checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                disabled={loading}
              />
              <span>Remember me for 7 days</span>
            </label>
          </div>

          {errorMessage && <p className="form-error">{errorMessage}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="login-footer">
          Don't have an account?{" "}
          <Link to="/register" className="login-link">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
