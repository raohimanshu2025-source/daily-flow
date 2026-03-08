import { Navigate } from "react-router-dom";
import { store } from "@/lib/store";

const Index = () => {
  return store.isOnboarded() ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />;
};

export default Index;
