import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />
  }
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const isExpired = decoded.exp * 1000 < Date.now();
    if (isExpired) {
      throw new Error('Token expired');
    }
    return children;
  } catch {
    return <Navigate to="/login" />;
  }
}