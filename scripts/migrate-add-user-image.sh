#!/bin/bash

# Script para aplicar a migração que adiciona a coluna image na tabela users
# Execute este script após configurar a variável DATABASE_URL

echo "🚀 Aplicando migração: Adicionar coluna image na tabela users"
echo ""

# Verificar se DATABASE_URL está definida
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Erro: DATABASE_URL não está definida"
    echo "Por favor, configure a variável de ambiente DATABASE_URL"
    echo "Exemplo: export DATABASE_URL='postgresql://user:password@localhost:5432/dbname'"
    exit 1
fi

echo "📊 Conectando ao banco de dados..."
echo ""

# Executar a migração
psql "$DATABASE_URL" -f scripts/add-user-image-column.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migração aplicada com sucesso!"
    echo ""
    echo "A coluna 'image' foi adicionada à tabela 'users'"
else
    echo ""
    echo "❌ Erro ao aplicar migração"
    exit 1
fi
