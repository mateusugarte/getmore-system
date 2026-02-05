import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-rose shadow-glow">
              <span className="text-xl font-bold text-primary-foreground">G</span>
            </div>
            <span className="text-2xl font-semibold text-gradient-rose">GestãoPro</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isLogin
                ? "Entre para acessar seu painel de gestão"
                : "Comece a gerenciar seu negócio de forma inteligente"}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  placeholder="Seu nome completo"
                  className="h-12"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="h-12"
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  className="h-12"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Link to="/dashboard">
              <Button
                type="submit"
                className="h-12 w-full gap-2 bg-gradient-rose text-lg font-medium hover:opacity-90"
              >
                {isLogin ? "Entrar" : "Criar Conta"}
                <ArrowRight size={18} />
              </Button>
            </Link>
          </form>

          {/* Toggle */}
          <p className="mt-8 text-center text-muted-foreground">
            {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-primary hover:underline"
            >
              {isLogin ? "Criar conta" : "Fazer login"}
            </button>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-rose p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 max-w-lg text-center"
        >
          <h2 className="text-4xl font-bold text-primary-foreground">
            Tenha clareza na sua gestão
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Organize seus leads, acompanhe metas e transforme contatos em clientes
            fiéis com o GestãoPro.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { value: "500+", label: "Empresas" },
              { value: "10k+", label: "Leads" },
              { value: "98%", label: "Satisfação" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="rounded-xl bg-white/10 backdrop-blur-sm p-4"
              >
                <p className="text-2xl font-bold text-primary-foreground">{stat.value}</p>
                <p className="text-sm text-primary-foreground/70">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
