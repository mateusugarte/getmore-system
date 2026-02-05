import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Stripe product/price configuration
export const SUBSCRIPTION_CONFIG = {
  productId: "prod_TvKkQl6mkEGxCJ",
  priceId: "price_1SxU58I5QIoPfDm0TznwtQuO",
  name: "GetMore System",
  price: 37.90,
  currency: "BRL",
  interval: "month" as const,
};

interface SubscriptionState {
  subscribed: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  isLoading: boolean;
  error: string | null;
}

interface SubscriptionContextType extends SubscriptionState {
  checkSubscription: () => Promise<void>;
  createCheckout: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    productId: null,
    subscriptionEnd: null,
    isLoading: true, // Start with loading true for initial check
    error: null,
  });

  const checkSubscription = useCallback(async (isInitial = false) => {
    if (!user) {
      setState(prev => ({ ...prev, subscribed: false, productId: null, subscriptionEnd: null, isLoading: false }));
      return;
    }

    // Only show loading on initial check, not background refreshes
    if (isInitial) {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) throw error;
      
      setState({
        subscribed: data.subscribed || false,
        productId: data.product_id || null,
        subscriptionEnd: data.subscription_end || null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Erro ao verificar assinatura",
      }));
    }
  }, [user]);

  const createCheckout = useCallback(async () => {
    if (!user) {
      throw new Error("Você precisa estar logado para assinar");
    }

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      throw error;
    }
  }, [user]);

  const openCustomerPortal = useCallback(async () => {
    if (!user) {
      throw new Error("Você precisa estar logado");
    }

    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      throw error;
    }
  }, [user]);

  // Check subscription on auth state change (initial load only)
  useEffect(() => {
    if (!authLoading && user && !hasInitiallyLoaded) {
      setHasInitiallyLoaded(true);
      checkSubscription(true); // Initial check with loading
    } else if (!authLoading && !user) {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user, authLoading, hasInitiallyLoaded, checkSubscription]);

  // Periodic refresh every 60 seconds (background, no loading spinner)
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      checkSubscription(false); // Background refresh, no loading
    }, 60000);

    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        ...state,
        checkSubscription,
        createCheckout,
        openCustomerPortal,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};
