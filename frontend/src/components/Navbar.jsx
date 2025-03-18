import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Visualist</Link>
      </div>
      
      <div className="navbar-nav">
        <Link to="/anime" className="nav-link">Anime</Link>
        <Link to="/movies" className="nav-link">Movies</Link>
        <Link to="/series" className="nav-link">Series</Link>
      </div>
      
      <div className="navbar-buttons">
        <Link to="/login">
          <button className="navbar-btn">Sign In</button>
        </Link>
        <Link to="/register">
          <button className="navbar-btn">Register</button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
