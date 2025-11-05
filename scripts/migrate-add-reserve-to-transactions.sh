#!/bin/bash

# Script para adicionar suporte a transações de reserva

echo "Executando migração para adicionar suporte a transações de reserva..."

# Conectar ao banco de dados e executar a migração
psql $DATABASE_URL -f drizzle/0009_add_reserve_to_transactions.sql

if [ $? -eq 0 ]; then
  echo "✅ Migração executada com sucesso!"
else
  echo "❌ Erro ao executar a migração."
  exit 1
fi
