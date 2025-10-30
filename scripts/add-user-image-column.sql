-- Adicionar coluna image na tabela users
-- Esta migração adiciona a coluna para armazenar a URL da foto do usuário
ALTER TABLE
    users
ADD
    COLUMN IF NOT EXISTS image TEXT;

-- Comentário explicativo da coluna
COMMENT ON COLUMN users.image IS 'URL da foto do perfil do usuário';