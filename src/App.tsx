import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SubscriptionGuard } from "@/components/SubscriptionGuard";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Pipeline from "./pages/Pipeline";
import Metas from "./pages/Metas";
import Clientes from "./pages/Clientes";
import Cobrancas from "./pages/Cobrancas";
import Assinatura from "./pages/Assinatura";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SubscriptionProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/assinatura" element={<ProtectedRoute><Assinatura /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><SubscriptionGuard><Dashboard /></SubscriptionGuard></ProtectedRoute>} />
            <Route path="/pipeline" element={<ProtectedRoute><SubscriptionGuard><Pipeline /></SubscriptionGuard></ProtectedRoute>} />
            <Route path="/metas" element={<ProtectedRoute><SubscriptionGuard><Metas /></SubscriptionGuard></ProtectedRoute>} />
            <Route path="/clientes" element={<ProtectedRoute><SubscriptionGuard><Clientes /></SubscriptionGuard></ProtectedRoute>} />
            <Route path="/cobrancas" element={<ProtectedRoute><SubscriptionGuard><Cobrancas /></SubscriptionGuard></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SubscriptionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
