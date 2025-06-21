import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import ErrorBoundary from '@/components/ErrorBoundary';
import PrivateRoute from '@/components/routes/PrivateRoute';
import { GlobalLoader } from '@/components/GlobalLoader';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DefaultLayout = lazy(() => import('./layouts/DefaultLayout'));
const SimpleLayout = lazy(() => import('./layouts/SimpleLayout'));

function App() {
  return (
    <>
      <BrowserRouter>
        <Toaster position="top-center" />
        <Suspense fallback={<GlobalLoader />}>
          <Routes>
            <Route path="/login"
              element={
                <ErrorBoundary>
                  <SimpleLayout>
                    <Login />
                  </SimpleLayout>
                </ErrorBoundary>
              }
            />
            <Route path="/register"
              element={
                <ErrorBoundary>
                  <SimpleLayout>
                    <Register />
                  </SimpleLayout>
                </ErrorBoundary>
              }
            />
            <Route path="/"
              element={
                <PrivateRoute>
                  <DefaultLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="home" />} />
              <Route path="home"
                element={
                  <ErrorBoundary>
                    <Dashboard />
                  </ErrorBoundary>
                }
              />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;
