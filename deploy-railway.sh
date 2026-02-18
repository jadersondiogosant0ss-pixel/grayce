#!/bin/bash
# Deploy Bot grayce no Railway.app em um comando

echo "=========================================="
echo "🚂 Deploy Bot grayce no Railway.app"
echo "=========================================="
echo ""

# Verifica se Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo "📦 Instalando Railway CLI..."
    npm install -g @railway/cli || {
        echo "❌ Erro: Instale Node.js primeiro"
        echo "https://nodejs.org"
        exit 1
    }
fi

echo "✓ Railway CLI encontrado"
echo ""

# Login
echo "🔐 Fazendo login no Railway..."
railway login

echo ""
echo "🚀 Criando novo projeto..."
railway init

echo ""
echo "⚙️  Configurando variáveis de ambiente..."
echo ""
echo "Digite suas credenciais:"
echo ""

read -p "ANTHROPIC_API_KEY: " ANTHROPIC_KEY
railway variables set ANTHROPIC_API_KEY="$ANTHROPIC_KEY"

read -p "EVOLUTION_API_URL: " EVOLUTION_URL
railway variables set EVOLUTION_API_URL="$EVOLUTION_URL"

read -p "EVOLUTION_API_KEY: " EVOLUTION_KEY
railway variables set EVOLUTION_API_KEY="$EVOLUTION_KEY"

railway variables set PORT=8080
railway variables set HOST=0.0.0.0
railway variables set DEBUG=false

echo ""
echo "🚀 Fazendo deploy..."
railway up

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📊 Status: railway status"
echo "📝 Logs: railway logs"
echo "🌐 Domínio: railway domain"
echo ""
echo "Configure o webhook com a URL gerada + /webhook"
