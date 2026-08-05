import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MoneyPage from './pages/MoneyPage';
import MoneySourcesPage from './pages/MoneySourcesPage';
import TransactionsPage from './pages/TransactionsPage';
import PlansPage from './pages/PlansPage';
import ObjectivesPage from './pages/ObjectivesPage';
import ProjectsPage from './pages/ProjectsPage';
import SavingsPage from './pages/SavingsPage';
import AchievementsPage from './pages/AchievementsPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected app routes with bottom nav */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Money section */}
            <Route path="/money" element={<MoneyPage />}>
              <Route index element={<Navigate to="sources" replace />} />
              <Route path="sources" element={<MoneySourcesPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
            </Route>

            {/* Plans section */}
            <Route path="/plans" element={<PlansPage />}>
              <Route index element={<Navigate to="objectives" replace />} />
              <Route path="objectives" element={<ObjectivesPage />} />
              <Route path="projects" element={<ProjectsPage />} />
            </Route>

            {/* Savings */}
            <Route path="/savings" element={<SavingsPage />} />

            {/* Achievements */}
            <Route path="/achievements" element={<AchievementsPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
