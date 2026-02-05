import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubscription, SUBSCRIPTION_CONFIG } from "@/contexts/SubscriptionContext";
import { Check, Crown, Loader2, Settings, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Assinatura = () => {
  const { 
    subscribed, 
    subscriptionEnd, 
    isLoading, 
    createCheckout, 
    openCustomerPortal,
    checkSubscription 
  } = useSubscription();

  const handleSubscribe = async () => {
    try {
      await createCheckout();
    } catch (error) {
      toast.error("Erro ao iniciar checkout. Tente novamente.");
    }
  };

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
    } catch (error) {
      toast.error("Erro ao abrir portal de gerenciamento.");
    }
  };

  const handleRefresh = async () => {
    await checkSubscription();
    toast.success("Status atualizado!");
  };

  const features = [
    "Dashboard completo com métricas",
    "Gestão de leads e pipeline de vendas",
    "Gerenciamento de clientes",
    "Sistema de metas e objetivos",
    "Cobranças recorrentes automatizadas",
    "Suporte prioritário",
  ];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Assinatura</h1>
            <p className="text-muted-foreground">
              Gerencie sua assinatura do GetMore System
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Current Status */}
        {subscribed && (
          <Card className="border-primary bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Sua Assinatura Ativa</CardTitle>
                <Badge variant="default" className="ml-auto">Ativo</Badge>
              </div>
              <CardDescription>
                {subscriptionEnd && (
                  <>
                    Próxima renovação em{" "}
                    {format(new Date(subscriptionEnd), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleManageSubscription} variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Gerenciar Assinatura
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pricing Card */}
        <Card className={subscribed ? "opacity-60" : ""}>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">{SUBSCRIPTION_CONFIG.name}</CardTitle>
            <CardDescription>Acesso completo a todas as funcionalidades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <span className="text-4xl font-bold">
                R$ {SUBSCRIPTION_CONFIG.price.toFixed(2).replace(".", ",")}
              </span>
              <span className="text-muted-foreground">/mês</span>
            </div>

            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {!subscribed && (
              <Button 
                onClick={handleSubscribe} 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  "Assinar Agora"
                )}
              </Button>
            )}

            {subscribed && (
              <div className="text-center text-sm text-muted-foreground">
                Você já possui uma assinatura ativa
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Assinatura;
