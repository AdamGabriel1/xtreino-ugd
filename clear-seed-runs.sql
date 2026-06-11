-- ============================================================
-- LIMPA TABELA seed_runs PARA MIGRAÇÃO DOS SEEDS
-- Rode isto uma vez antes de subir o novo sistema
-- ============================================================

-- Remove registros antigos dos seeds individuais de xtreino
DELETE FROM seed_runs WHERE seedName IN (
  'xtreino_historico',
  'xtreino_08062026',
  'xtreino_09062026',
  'xtreino_10062026'
);

-- Remove o seed genérico antigo (se existir) pra rodar de novo
DELETE FROM seed_runs WHERE seedName = 'xtreinos_all';

-- Remove o seed de logos (se quiser re-rodar)
DELETE FROM seed_runs WHERE seedName = 'logos';

-- Verifica o que sobrou
SELECT seedName, runAt FROM seed_runs ORDER BY runAt DESC;
