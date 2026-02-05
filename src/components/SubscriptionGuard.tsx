import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { GlobalLoader } from "./GlobalLoader";

interface SubscriptionGuardProps {
  children: ReactNode;
}

export const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { subscribed, isLoading } = useSubscription();

  if (isLoading) {
    return <GlobalLoader isLoading={true} />;
  }

  if (!subscribed) {
    return <Navigate to="/assinatura" replace />;
  }

  return <>{children}</>;
};
