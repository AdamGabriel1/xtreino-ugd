# Admin XTreinos - Refatoração

## 📁 Estrutura de Arquivos

```
AdminXTreinos/
├── index.tsx                    ← Página principal (orquestrador)
├── types.ts                     ← Tipos TypeScript compartilhados
├── index-export.ts              ← Barrel export
│
├── hooks/
│   └── useXTreinos.ts           ← Custom hook com todas as queries/mutations
│
├── components/
│   ├── XTreinoForm.tsx          ← Form de criar/editar xtreino
│   ├── ResultForm.tsx           ← Form de adicionar resultado
│   ├── PlayerForm.tsx           ← Form de adicionar stats de jogador
│   ├── ScheduleForm.tsx         ← Form de agendamento
│   ├── WhatsAppGenerator.tsx    ← 🆕 Gerador de mensagem WhatsApp
│   └── InscricoesManager.tsx    ← 🆕 Gerenciador de inscrições de times
│
└── tabs/
    ├── XTreinosList.tsx         ← Tab: Lista de xtreinos
    ├── ResultsTab.tsx           ← Tab: Resultados
    ├── PlayersTab.tsx           ← Tab: Jogadores
    ├── ScheduleTab.tsx          ← Tab: Agenda
    └── InscricoesTab.tsx        ← 🆕 Tab: Inscrições + WhatsApp
```

## 🆕 Funcionalidades Adicionadas

### 1. Tab "Inscrições" (NOVO)
- Selecionar xtreino para gerenciar
- Adicionar times à lista (existentes ou novos)
- Remover times da lista
- Visualizar slots confirmados e reservas
- Gerenciar times fixos (📌) vs temporários (🎫)

### 2. Gerador de Mensagem WhatsApp (NOVO)
- Template com formatação completa (emojis, horários multi-país)
- Preview da mensagem em tempo real
- Botão de copiar com um clique
- Configuração de data e número de quedas
- Diferenciação automática de fixos (📌) e temporários (🎫)

### 3. Gerenciamento de Times Fixos
- Editar lista de times fixos pelo painel
- Toggle fixo/temporário por time
- Persistência no banco (settings.fixedTeamsList)

## 🔧 Alterações Necessárias no Backend

### 1. Schema - Adicionar coluna fixedTeamsList
```typescript
// db/schema.ts
export const settings = sqliteTable("settings", {
  // ... campos existentes ...
  fixedTeamsList: text("fixed_teams_list"), // JSON string ["UGD Threat", ...]
});
```

### 2. tRPC Router - Adicionar procedures
```typescript
// server/routers/xtreinos.ts

// Registrations
registerTeam: publicProcedure
  .input(z.object({ xtreinoId: z.number(), teamName: z.string(), isFixed: z.boolean() }))
  .mutation(async ({ input }) => { /* ... */ }),

unregisterTeam: publicProcedure
  .input(z.object({ xtreinoId: z.number(), teamName: z.string() }))
  .mutation(async ({ input }) => { /* ... */ }),

// Settings
toggleFixedTeam: publicProcedure
  .input(z.object({ teamName: z.string(), isFixed: z.boolean() }))
  .mutation(async ({ input, ctx }) => {
    const settings = await ctx.db.select().from(settingsTable).limit(1);
    const current = settings[0]?.fixedTeamsList 
      ? JSON.parse(settings[0].fixedTeamsList) 
      : [];

    const updated = input.isFixed
      ? [...new Set([...current, input.teamName])]
      : current.filter((t: string) => t !== input.teamName);

    await ctx.db.update(settingsTable)
      .set({ fixedTeamsList: JSON.stringify(updated) })
      .run();

    return { fixedTeams: updated };
  }),

updateFixedTeams: publicProcedure
  .input(z.object({ teams: z.array(z.string()) }))
  .mutation(async ({ input, ctx }) => {
    await ctx.db.update(settingsTable)
      .set({ fixedTeamsList: JSON.stringify(input.teams) })
      .run();
    return { success: true };
  }),
```

### 3. tRPC Router - Settings query
```typescript
// server/routers/settings.ts
get: publicProcedure.query(async ({ ctx }) => {
  return ctx.db.select().from(settingsTable).limit(1).get();
}),
```

## 📥 Instalação

1. Copiar pasta `AdminXTreinos/` para `src/components/AdminXTreinos/`
2. Atualizar imports no router principal
3. Adicionar coluna `fixedTeamsList` no schema
4. Gerar migração: `npx drizzle-kit generate`
5. Aplicar migração: `npx drizzle-kit migrate`

## 🎨 Uso

```tsx
// pages/admin/xtreinos.tsx
import AdminXTreinos from "@/components/AdminXTreinos";

export default function Page() {
  return <AdminXTreinos />;
}
```

## 📊 Tamanho dos Arquivos

| Arquivo | Linhas | Descrição |
|---------|--------|-----------|
| index.tsx | ~280 | Página principal |
| types.ts | ~90 | Tipos |
| useXTreinos.ts | ~120 | Hook |
| XTreinoForm.tsx | ~140 | Form xtreino |
| ResultForm.tsx | ~100 | Form resultado |
| PlayerForm.tsx | ~110 | Form jogador |
| ScheduleForm.tsx | ~100 | Form agenda |
| WhatsAppGenerator.tsx | ~180 | Gerador WhatsApp |
| InscricoesManager.tsx | ~220 | Gerenciar inscrições |
| XTreinosList.tsx | ~100 | Tab lista |
| ResultsTab.tsx | ~110 | Tab resultados |
| PlayersTab.tsx | ~100 | Tab jogadores |
| ScheduleTab.tsx | ~100 | Tab agenda |
| InscricoesTab.tsx | ~100 | Tab inscrições |

**Total: ~1.850 linhas** (divididas em 14 arquivos)

vs **~800 linhas** no arquivo original monolítico
