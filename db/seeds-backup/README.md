# Sistema de Seeds

## Estrutura

```
db/
├── schema.ts          # Tabelas do Drizzle (inclui seed_runs)
├── seed.ts            # Seed inicial (idempotente)
├── seed-runner.ts     # Orquestrador de seeds
└── seeds/
    ├── _template.ts       # Template para novos seeds
    ├── 2026-06-03.ts      # Seed do dia 03/06
    ├── 2026-06-04.ts      # Seed do dia 04/06
    └── ...
```

## Como adicionar um seed diario

### 1. Copie o template

```bash
cp db/seeds/_template.ts db/seeds/2026-06-04.ts
```

### 2. Edite o arquivo

- Substitua `{{DATE}}` pela data real
- Adicione os dados que quer inserir
- **Sempre use upsert** (verificar se existe antes de inserir)

### 3. Importe no boot.ts

```typescript
// No topo do arquivo, adicione:
import { seed as seed20260604 } from "@db/seeds/2026-06-04.js";

// Na secao de seeds diarios, adicione:
runSeedIfNeeded("daily_2026_06_04", seed20260604);
```

### 4. Rode o drizzle-kit push (se alterou schema)

```bash
npm run db:push
```

### 5. Reinicie o servidor

O seed sera executado automaticamente na proxima inicializacao.

## Regras importantes

1. **Todos os seeds devem ser idempotentes** — pode rodar N vezes sem erro
2. **Sempre verifique se o dado ja existe** antes de inserir
3. **Use nomes unicos** para identificar registros (ex: nome do campeonato)
4. **Nunca remova** seeds antigos do boot.ts — eles serao pulados automaticamente
5. **Mantenha a ordem cronologica** dos seeds no boot.ts

## Como funciona o controle

A tabela `seed_runs` guarda o registro de quais seeds ja foram executados:

| id | seed_name          | executed_at         |
|----|--------------------|---------------------|
| 1  | daily_2026_06_03   | 2026-06-03 10:00:00 |
| 2  | daily_2026_06_04   | 2026-06-04 10:00:00 |

Na proxima vez que o servidor iniciar, o `runSeedIfNeeded()` verifica essa tabela e **pula** os seeds ja executados.
