import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProjectDashboard from './components/ProjectDashboard';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import { AuthProvider } from './components/Auth/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<ProjectDashboard />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}