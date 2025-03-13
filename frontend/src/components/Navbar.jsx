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
      
      <div>
        <button className="sign-in-btn">
          Sign In
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
