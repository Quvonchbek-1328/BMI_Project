import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Landing from '../pages/Landing';
import Dashboard from '../pages/Dashboard';
import Projects from '../pages/Projects';
import ProjectDetails from '../pages/ProjectDetails';
import Tasks from '../pages/Tasks';
import Predictions from '../pages/Predictions';
import RiskAnalytics from '../pages/RiskAnalytics';
import Admin from '../pages/Admin';
import Alerts from '../pages/Alerts';
import Profile from '../pages/Profile';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes with sidebar layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/projects/:id/tasks" element={<Tasks />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/analytics" element={<RiskAnalytics />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Admin-only routes */}
      <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
