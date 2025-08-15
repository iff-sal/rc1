import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './styles/index.css'; // Import Tailwind CSS

// Placeholder Components (create these files later)
const HomePage = () => <div>Home Page</div>;
const AboutPage = () => <div>About Page</div>;
const NotFoundPage = () => <div>404 Not Found</div>;

function App() {
  return (
    <Router>
      <div className="App">
        {/* Add your navigation here */}
        {/* <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav> */}

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          {/* Add more routes here */}
          <Route path="*" element={<NotFoundPage />} /> {/* Catch-all for 404 */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;