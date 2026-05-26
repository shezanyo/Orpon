import { Navigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Card>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-sm text-slate-600">Welcome back, {user?.email}.</p>
      <p className="mt-3 text-sm text-slate-600">
        This protected area is where campaign creators manage campaigns and transparency settings.
      </p>
    </Card>
  );
}
