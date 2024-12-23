import React from 'react';
import './styles/globals.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TodoList from './pages';
import Dashboard from './pages/dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TodoList />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
