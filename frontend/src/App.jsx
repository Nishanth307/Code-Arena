import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import Dashboard from "./pages/dashoard/Dashboard.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import Layout from "./components/common/Layout.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth routes without Sidebar/Navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Dashboard route inside Layout */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* All other routes wrapped in Layout */}
          <Route 
            path="/*" 
            element={
              <Layout>
                <AppRoutes />
              </Layout>
            } 
          />
          
          {/* Default redirect to problems list */}
          <Route path="/" element={<Navigate to="/problems" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
