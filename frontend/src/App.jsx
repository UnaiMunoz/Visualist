import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Anime from './pages/Anime';
import Movies from './pages/Movies';
import Series from './pages/Series';
import Register from './pages/Register';  // Import Register component
import Login from './pages/Login';  // Import Login component

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/anime" element={<Anime />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/series" element={<Series />} />
          <Route path="/register" element={<Register />} />  {/* Register route */}
          <Route path="/login" element={<Login />} />  {/* Login route */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
