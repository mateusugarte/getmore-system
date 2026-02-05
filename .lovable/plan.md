
# Correção: Aceitar Assinaturas em Trial

## Problema Identificado
A edge function `check-subscription` busca apenas assinaturas com status `"active"`, mas sua assinatura está com status `"trialing"` (período de teste). Isso bloqueia o acesso mesmo com uma assinatura válida.

## Solução
Modificar a edge function para aceitar tanto assinaturas **ativas** quanto **em trial**.

---

## O que será alterado

### 1. Atualizar `supabase/functions/check-subscription/index.ts`

**Antes:**
```typescript
const subscriptions = await stripe.subscriptions.list({
  customer: customerId,
  status: "active",
  limit: 1,
});
```

**Depois:**
```typescript
// Buscar assinaturas ativas OU em trial
const subscriptions = await stripe.subscriptions.list({
  customer: customerId,
  limit: 10,
});

// Filtrar para aceitar 'active' e 'trialing'
const validSubscription = subscriptions.data.find(
  sub => sub.status === "active" || sub.status === "trialing"
);
```

---

## Lógica Atualizada

A função passará a:
1. Buscar todas as assinaturas do cliente (sem filtro de status)
2. Verificar se existe alguma com status `active` OU `trialing`
3. Retornar `subscribed: true` se encontrar uma válida

---

## Arquivos Modificados

| Arquivo | Ação |
|---------|------|
| `supabase/functions/check-subscription/index.ts` | Editar |

---

## Resultado Esperado

Após a correção, usuários com assinaturas em período de trial terão acesso normal ao sistema, assim como usuários com assinaturas ativas.
