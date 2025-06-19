// In App.jsx
import React from 'react';
import PathMap from './PathMap';
import './App.css';
import { FaLinkedin } from 'react-icons/fa'; 

function App() {
  return (
    <div className="App">
      <h1>IIT Kharagpur Pathfinder</h1>
      <PathMap />
      <footer className="app-footer">
        Navigating the KGP maze using Dijkstra's Algorithm. A project by{' '}
        <a 
          href="https://www.linkedin.com/in/ashutosh-singh-6415b5293/" 
          target="_blank" 
          rel="noopener noreferrer"
        >
         
          <FaLinkedin /> Ashutosh Singh
        </a>.
      </footer>
    </div>
  );
}

export default App;