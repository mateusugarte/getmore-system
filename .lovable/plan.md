
# Plano: Controle de Acesso por Assinatura

## Visão Geral
Implementar verificação de assinatura ativa para acesso ao sistema. Usuários sem assinatura serão redirecionados automaticamente para a página de assinatura.

---

## Como Vai Funcionar

```text
┌─────────────────────────────────────────────────────────────┐
│                    Fluxo de Acesso                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Usuário acessa qualquer página                            │
│              │                                              │
│              ▼                                              │
│   ┌──────────────────┐                                      │
│   │ Está autenticado? │                                     │
│   └────────┬─────────┘                                      │
│       Não  │  Sim                                           │
│       ▼    │                                                │
│   /auth    ▼                                                │
│   ┌───────────────────┐                                     │
│   │ Tem assinatura?   │                                     │
│   └────────┬──────────┘                                     │
│       Não  │  Sim                                           │
│       ▼    │                                                │
│  /assinatura  ▼                                             │
│            ┌─────────────────┐                              │
│            │ Acessa a página │                              │
│            └─────────────────┘                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Regras:**
- Página `/auth` - Sempre acessível (login/cadastro)
- Página `/assinatura` - Acessível para usuários logados (com ou sem assinatura)
- Demais páginas - Requer login E assinatura ativa

---

## Etapas de Implementação

### 1. Criar Componente `SubscriptionGuard`
Novo componente que verifica se o usuário tem assinatura ativa antes de renderizar o conteúdo.

**Localização:** `src/components/SubscriptionGuard.tsx`

**Comportamento:**
- Mostra loader enquanto verifica assinatura
- Redireciona para `/assinatura` se não tiver assinatura
- Renderiza o conteúdo se tiver assinatura

### 2. Atualizar Rotas em `App.tsx`
Aplicar o `SubscriptionGuard` nas rotas protegidas, exceto na página de assinatura.

**Mudanças:**
- Dashboard, Pipeline, Metas, Clientes, Cobranças → `ProtectedRoute` + `SubscriptionGuard`
- Assinatura → Apenas `ProtectedRoute` (sem verificação de assinatura)

### 3. Mover SubscriptionProvider para Dentro do Contexto de Auth
Garantir que o provider de assinatura seja carregado após a autenticação estar disponível.

---

## Detalhes Técnicos

### Componente SubscriptionGuard
```typescript
// Recebe children e verifica subscription
// Se isLoading -> mostra GlobalLoader
// Se !subscribed -> Navigate para /assinatura
// Se subscribed -> renderiza children
```

### Estrutura das Rotas
```typescript
// Página de assinatura - só precisa estar logado
<Route path="/assinatura" element={
  <ProtectedRoute>
    <Assinatura />
  </ProtectedRoute>
} />

// Demais páginas - precisa estar logado E ter assinatura
<Route path="/dashboard" element={
  <ProtectedRoute>
    <SubscriptionGuard>
      <Dashboard />
    </SubscriptionGuard>
  </ProtectedRoute>
} />
```

---

## Arquivos que Serão Modificados

| Arquivo | Ação |
|---------|------|
| `src/components/SubscriptionGuard.tsx` | Criar (novo) |
| `src/App.tsx` | Editar rotas |

---

## Experiência do Usuário

1. **Novo usuário se cadastra** → Redirecionado para `/assinatura`
2. **Usuário assina** → Atualiza status via refresh e ganha acesso
3. **Usuário tenta acessar dashboard sem assinatura** → Redirecionado para `/assinatura`
4. **Usuário com assinatura ativa** → Acesso normal a todas as páginas
