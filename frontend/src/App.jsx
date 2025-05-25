import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Anime from "./pages/Anime";
import AnimeDetail from "./pages/AnimeDetail";
import Movies from "./pages/Movies";
import MovieDetail from "./pages/MovieDetail";
import Series from "./pages/Series";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Public Route Component (redirects if logged in)
const PublicRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (isLoggedIn) {
    return <Navigate to="/" />;
  }

  return children;
};

// Inner App Component with access to AuthContext
const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="wrapper">
          <div className="circle"></div>
          <div className="circle"></div>
          <div className="circle"></div>
          <div className="shadow"></div>
          <div className="shadow"></div>
          <div className="shadow"></div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/anime" element={<Anime />} />
        <Route path="/anime/:id" element={<AnimeDetail />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetail />} />
        <Route path="/series" element={<Series />} />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
