#!/bin/bash
# Deploy Bot grayce no Heroku em um comando

echo "=========================================="
echo "🟣 Deploy Bot grayce no Heroku"
echo "=========================================="
echo ""

# Verifica se Heroku CLI está instalado
if ! command -v heroku &> /dev/null; then
    echo "📦 Instalando Heroku CLI..."
    curl https://cli-assets.heroku.com/install.sh | sh
fi

echo "✓ Heroku CLI encontrado"
echo ""

# Login
echo "🔐 Fazendo login no Heroku..."
heroku login

echo ""
echo "🚀 Criando aplicação..."
heroku create bot-grayce-hrr-imoveis

echo ""
echo "⚙️  Configurando variáveis de ambiente..."
echo ""
echo "Digite suas credenciais:"
echo ""

read -p "ANTHROPIC_API_KEY: " ANTHROPIC_KEY
heroku config:set ANTHROPIC_API_KEY="$ANTHROPIC_KEY"

read -p "EVOLUTION_API_URL: " EVOLUTION_URL
heroku config:set EVOLUTION_API_URL="$EVOLUTION_URL"

read -p "EVOLUTION_API_KEY: " EVOLUTION_KEY
heroku config:set EVOLUTION_API_KEY="$EVOLUTION_KEY"

heroku config:set HOST=0.0.0.0
heroku config:set DEBUG=false

echo ""
echo "🚀 Fazendo deploy..."
git push heroku main

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "🌐 Abrindo app..."
heroku open

echo ""
echo "📝 Ver logs: heroku logs --tail"
echo "📊 Info: heroku info"
echo ""
echo "Configure o webhook com a URL gerada + /webhook"
