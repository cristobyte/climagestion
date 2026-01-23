import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Layout, ProtectedRoute } from './components';
import {
  LoginPage,
  DashboardPage,
  TasksListPage,
  TaskDetailPage,
  TaskFormPage,
  UsersListPage,
  UserFormPage,
} from './pages';
import { USER_ROLES } from '@hvac/shared';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Layout>
              <TasksListPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tasks/new"
        element={
          <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
            <Layout>
              <TaskFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tasks/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <TaskDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tasks/:id/edit"
        element={
          <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
            <Layout>
              <TaskFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
            <Layout>
              <UsersListPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users/new"
        element={
          <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
            <Layout>
              <UserFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users/:id/edit"
        element={
          <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
            <Layout>
              <UserFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
