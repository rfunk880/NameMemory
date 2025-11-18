import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GroupDetail from './pages/GroupDetail';
import PersonForm from './pages/PersonForm';
import LearningMode from './pages/LearningMode';
import QuickReference from './pages/QuickReference';
import SharesPage from './pages/SharesPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:id"
            element={
              <ProtectedRoute>
                <GroupDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:groupId/add-person"
            element={
              <ProtectedRoute>
                <PersonForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/people/:personId/edit"
            element={
              <ProtectedRoute>
                <PersonForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:id/learn"
            element={
              <ProtectedRoute>
                <LearningMode />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:id/quick-ref"
            element={
              <ProtectedRoute>
                <QuickReference />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:id/shares"
            element={
              <ProtectedRoute>
                <SharesPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
