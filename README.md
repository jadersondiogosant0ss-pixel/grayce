# 🌐 Bot grayce - HRR Imóveis

Bot de WhatsApp com IA para vendas de imóveis Minha Casa Minha Vida.

**Pronto para deploy na web em 10 minutos!**

---

## 🚀 Deploy Rápido (Escolha uma opção)

### 🥇 Render.com (GRÁTIS - Mais Fácil)

1. Fork este repositório no GitHub
2. Vá em https://render.com
3. New → Web Service → Connect seu repo
4. Configure:
   - Build: `pip install -r requirements.txt`
   - Start: `gunicorn app:app --bind 0.0.0.0:$PORT`
5. Adicione variáveis de ambiente:
   - `ANTHROPIC_API_KEY`
   - `EVOLUTION_API_URL`
   - `EVOLUTION_API_KEY`
6. Deploy!

**URL:** `https://bot-grayce-xxx.onrender.com`

### 🥈 Railway.app ($5/mês - Mais Rápido)

```bash
./deploy-railway.sh
```

Ou manualmente:
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### 🥉 Heroku ($7/mês - Tradicional)

```bash
./deploy-heroku.sh
```

Ou manualmente:
```bash
heroku create bot-grayce-hrr
heroku config:set ANTHROPIC_API_KEY=xxx
git push heroku main
```

---

## 📋 Informações do Bot

- **Nome:** grayce
- **Número:** 555195251053
- **Empresa:** HRR Imóveis
- **Time:** Team Bear
- **Gerente:** Diogo
- **Especialidade:** Minha Casa Minha Vida

---

## 🔑 Variáveis de Ambiente Necessárias

```env
ANTHROPIC_API_KEY=sk-ant-xxxxx  # Obtenha em https://console.anthropic.com
EVOLUTION_API_URL=https://sua-evolution.com
EVOLUTION_API_KEY=sua_key_aqui
```

Opcionais:
```env
PORT=5000
HOST=0.0.0.0
DEBUG=false
```

---

## 🌐 Endpoints da API

```
GET  /              Informações do bot
GET  /health        Health check
GET  /stats         Estatísticas
POST /webhook       Recebe mensagens (Evolution/Twilio/WhatsApp)
POST /send          Envia mensagem teste
GET  /history/:id   Histórico de conversa
```

---

## 📊 Testar Bot Online

```bash
# Substitua pela sua URL
URL="https://seu-bot.onrender.com"

# Health check
curl $URL/health

# Estatísticas
curl $URL/stats

# Teste mensagem
curl -X POST $URL/send \
  -H "Content-Type: application/json" \
  -d '{"sender": "teste", "message": "Oi"}'
```

---

## 📝 Configurar Webhook

Depois do deploy, configure o webhook:

**Evolution API:**
```
Webhook URL: https://seu-bot.onrender.com/webhook
```

**Twilio:**
```
When a message comes in: https://seu-bot.onrender.com/webhook
```

---

## 📂 Estrutura

```
bot-grayce/
├── app.py                      # Aplicação Flask
├── bot_config_grayce.json      # Configuração
├── requirements.txt            # Dependências
├── Procfile                    # Heroku/Render
├── runtime.txt                 # Python version
├── Dockerfile                  # Docker
├── docker-compose.yml          # Docker Compose
└── DEPLOY_WEB_AGORA.md        # Guia completo
```

---

## 📖 Documentação Completa

- **[DEPLOY_WEB_AGORA.md](DEPLOY_WEB_AGORA.md)** - Deploy passo a passo em todas as plataformas
- **[README_WEB.md](README_WEB.md)** - Guia completo da API e recursos
- **[DEPLOY_SERVIDOR_WEB.md](DEPLOY_SERVIDOR_WEB.md)** - Deploy em VPS/Cloud
- **[PERSONALIDADE_GRAYCE_HRR.md](PERSONALIDADE_GRAYCE_HRR.md)** - Personalidade do bot

---

## 🎭 Personalidade

A grayce é uma vendedora real da HRR Imóveis que:

✅ Nunca menciona ser IA ou bot
✅ Especialista em Minha Casa Minha Vida
✅ Faz parte do Team Bear (gerente: Diogo)
✅ Tom casual e amigável
✅ Qualifica leads e agenda visitas

---

## ⚡ Início Rápido Local (Desenvolvimento)

```bash
# Clone
git clone https://github.com/seu-usuario/bot-grayce.git
cd bot-grayce

# Configure
cp .env.grayce .env
nano .env  # Adicione credenciais

# Com Docker
docker-compose up -d

# Sem Docker
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

---

## 🆘 Suporte

**Problemas?**
- Leia `DEPLOY_WEB_AGORA.md`
- Verifique logs na plataforma
- Teste health check: `/health`

**HRR Imóveis - Team Bear**
- Bot: 555195251053
- Gerente: Diogo

---

## 📄 Licença

Bot desenvolvido para HRR Imóveis com CREAO Platform.

**🏠 Realizando o sonho da casa própria! 💙**

---

## ✅ Checklist de Deploy

- [ ] Fork/clone repositório
- [ ] Obter `ANTHROPIC_API_KEY` em https://console.anthropic.com
- [ ] Configurar Evolution API ou Twilio
- [ ] Escolher plataforma (Render/Railway/Heroku)
- [ ] Fazer deploy
- [ ] Configurar webhook
- [ ] Testar com mensagem real
- [ ] Monitorar logs
- [ ] Notificar time (Diogo)

---

**🚀 Deploy em 10 minutos • Desenvolvido com CREAO Platform**
