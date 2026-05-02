import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(true);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('light-mode');
  };

  return (
    <Router>
      <div className={`app-wrapper ${darkMode ? '' : 'light-mode'}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/dashboard"
            element={
              <DashboardPage
                darkMode={darkMode}
                toggleTheme={toggleTheme}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
