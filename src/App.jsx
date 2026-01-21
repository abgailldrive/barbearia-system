import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import Profile from './pages/Profile';
import Services from './pages/Services';
import { useAuth } from './context/AuthContext';

function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Shared Private Routes */}
      <Route path="/profile" element={
        <PrivateRoute allowedRoles={['client', 'barber', 'admin']}>
          <Profile />
        </PrivateRoute>
      } />

      {/* Client Routes */}
      <Route path="/booking" element={
        <PrivateRoute allowedRoles={['client', 'barber', 'admin']}>
          <Booking />
        </PrivateRoute>
      } />

      {/* Admin/Barber Routes */}
      <Route path="/dashboard" element={
        <PrivateRoute allowedRoles={['barber', 'admin']}>
          <Dashboard />
        </PrivateRoute>
      } />
      <Route path="/services" element={
        <PrivateRoute allowedRoles={['barber', 'admin']}>
          <Services />
        </PrivateRoute>
      } />
    </Routes>
  );
}

export default App;
