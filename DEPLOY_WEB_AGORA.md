# 🚀 Deploy Bot grayce NA WEB AGORA (em 10 minutos)

Guia para fazer deploy **DIRETO NA WEB** sem precisar de servidor local.

---

## 🎯 Melhores Opções (Ordem de Facilidade)

### 1. 🥇 **Render.com** (MAIS FÁCIL - GRÁTIS)
- ✅ Deploy em 2 cliques
- ✅ Grátis (suficiente para começar)
- ✅ SSL/HTTPS automático
- ✅ URL pública automática
- ⚠️ Dorme após 15 min inativo (plano grátis)

### 2. 🥈 **Railway.app** (FÁCIL - $5/MÊS)
- ✅ Deploy automático do GitHub
- ✅ $5 de crédito grátis
- ✅ Não dorme
- ✅ Muito rápido

### 3. 🥉 **DigitalOcean App Platform** (SIMPLES - $5/MÊS)
- ✅ Deploy do GitHub
- ✅ Infraestrutura robusta
- ✅ $200 crédito grátis (60 dias)

### 4. **Heroku** (TRADICIONAL - $7/MÊS)
- ✅ Muito conhecido
- ⚠️ Não tem plano grátis
- ✅ Fácil de usar

---

## 🚀 OPÇÃO 1: Deploy no Render.com (RECOMENDADO)

### Passo 1: Preparar Repositório GitHub

```bash
# Se ainda não tem um repositório:
cd /caminho/para/bot-grayce

# Inicializar Git
git init
git add .
git commit -m "Bot grayce - HRR Imóveis - Pronto para deploy"

# Criar repositório no GitHub:
# Vá em https://github.com/new
# Nome: bot-grayce-hrr
# Privado: ✅ (recomendado)
# Criar repositório

# Enviar para GitHub
git remote add origin git@github.com:seu-usuario/bot-grayce-hrr.git
git branch -M main
git push -u origin main
```

### Passo 2: Deploy no Render

1. **Acesse:** https://render.com
2. **Sign Up** com GitHub
3. **New** → **Web Service**
4. **Connect** seu repositório `bot-grayce-hrr`
5. **Configure:**

```yaml
Name: bot-grayce-hrr-imoveis
Environment: Python 3
Region: Oregon (ou mais próximo do Brasil)
Branch: main
Build Command: pip install -r requirements.txt
Start Command: gunicorn app:app --bind 0.0.0.0:$PORT
```

6. **Environment Variables** (clique em "Add Environment Variable"):

```
ANTHROPIC_API_KEY = sk-ant-xxxxxxxxxxxxxxxx
EVOLUTION_API_URL = https://sua-evolution-api.com
EVOLUTION_API_KEY = sua_key_aqui
PORT = 10000
```

7. **Create Web Service**

✅ **Em 2-3 minutos seu bot estará online!**

URL será algo como: `https://bot-grayce-hrr-imoveis.onrender.com`

### Passo 3: Configurar Webhook

Copie a URL do Render e configure:

**Evolution API:**
- Webhook URL: `https://bot-grayce-hrr-imoveis.onrender.com/webhook`

**Twilio:**
- When a message comes in: `https://bot-grayce-hrr-imoveis.onrender.com/webhook`

---

## 🚀 OPÇÃO 2: Deploy no Railway.app

### Passo 1: Preparar GitHub (mesmo processo acima)

### Passo 2: Deploy no Railway

1. **Acesse:** https://railway.app
2. **Login** com GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Selecione** `bot-grayce-hrr`
5. **Add Variables:**

```
ANTHROPIC_API_KEY = sk-ant-xxxxxxxxxxxxxxxx
EVOLUTION_API_URL = https://sua-evolution-api.com
EVOLUTION_API_KEY = sua_key_aqui
PORT = 8080
```

6. **Deploy**

Railway detectará automaticamente Python e instalará dependências.

7. **Settings** → **Networking** → **Generate Domain**

URL será: `https://bot-grayce-hrr-production.up.railway.app`

### Passo 3: Configurar Webhook

Use a URL gerada pelo Railway no Evolution API ou Twilio.

---

## 🚀 OPÇÃO 3: Deploy no DigitalOcean App Platform

### Passo 1: Criar Conta DigitalOcean

1. **Acesse:** https://www.digitalocean.com
2. **Sign Up** (pegue $200 grátis por 60 dias)
3. **Verifique** email e adicione método de pagamento

### Passo 2: Deploy App

1. **Apps** → **Create App**
2. **GitHub** → Autorize e selecione `bot-grayce-hrr`
3. **Configure:**

```
Name: bot-grayce-hrr
Branch: main
Autodeploy: ✅ Yes
```

4. **Environment Variables:**

```
ANTHROPIC_API_KEY = sk-ant-xxxxxxxxxxxxxxxx
EVOLUTION_API_URL = https://sua-evolution-api.com
EVOLUTION_API_KEY = sua_key_aqui
```

5. **Review** → **Create Resources**

Aguarde 5-10 minutos. URL será: `https://bot-grayce-hrr-xxxxx.ondigitalocean.app`

---

## 🚀 OPÇÃO 4: Deploy no Heroku

### Passo 1: Criar arquivo Procfile

```bash
# Crie na raiz do projeto
echo "web: gunicorn app:app" > Procfile
git add Procfile
git commit -m "Add Procfile for Heroku"
```

### Passo 2: Deploy

1. **Instale Heroku CLI:**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

2. **Login e Deploy:**
```bash
heroku login
heroku create bot-grayce-hrr-imoveis
heroku config:set ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
heroku config:set EVOLUTION_API_URL=https://sua-evolution.com
heroku config:set EVOLUTION_API_KEY=sua_key
git push heroku main
```

3. **Abra:**
```bash
heroku open
```

URL será: `https://bot-grayce-hrr-imoveis.herokuapp.com`

---

## ⚡ SUPER RÁPIDO: Deploy com CREAO Platform

Se você tem acesso à plataforma CREAO, pode usar o serviço de deploy integrado:

```bash
# Use a ferramenta de deploy da CREAO
# O bot já está configurado para rodar
```

---

## 🔧 Arquivo Especial para Render/Railway: runtime.txt

Para garantir Python 3.11, crie:

```bash
echo "python-3.11.0" > runtime.txt
git add runtime.txt
git commit -m "Add Python runtime"
git push
```

---

## 🌐 Testando o Bot na Web

Depois do deploy:

```bash
# Substitua pela sua URL
URL="https://bot-grayce-hrr-imoveis.onrender.com"

# Health check
curl $URL/health

# Estatísticas
curl $URL/stats

# Teste de mensagem
curl -X POST $URL/send \
  -H "Content-Type: application/json" \
  -d '{"sender": "teste", "message": "Oi grayce"}'
```

---

## 📊 Comparação de Plataformas

| Plataforma | Preço | Facilidade | SSL | Uptime | Recomendação |
|------------|-------|------------|-----|--------|--------------|
| **Render.com** | Grátis* | ⭐⭐⭐⭐⭐ | ✅ Auto | 99%* | 🥇 Melhor para começar |
| **Railway** | $5/mês | ⭐⭐⭐⭐⭐ | ✅ Auto | 99.9% | 🥈 Melhor custo-benefício |
| **DigitalOcean** | $5/mês | ⭐⭐⭐⭐ | ✅ Auto | 99.99% | 🥉 Mais profissional |
| **Heroku** | $7/mês | ⭐⭐⭐⭐ | ✅ Auto | 99.9% | Tradicional |

\* Plano grátis do Render dorme após 15 min sem uso

---

## 🔥 RECOMENDAÇÃO FINAL

### Para Testes (Grátis):
**Use Render.com** - Deploy em 2 minutos, grátis

### Para Produção (Pago):
**Use Railway.app** - $5/mês, nunca dorme, muito rápido

### Para Empresa (Profissional):
**Use DigitalOcean** - $5/mês, infraestrutura robusta, suporte 24/7

---

## ✅ Checklist Pré-Deploy

- [ ] Código no GitHub (repositório privado recomendado)
- [ ] `.env.grayce` renomeado ou variáveis configuradas na plataforma
- [ ] `ANTHROPIC_API_KEY` obtida (https://console.anthropic.com)
- [ ] Evolution API rodando OU Twilio configurado
- [ ] `requirements.txt` atualizado
- [ ] `Procfile` criado (se Heroku)
- [ ] `runtime.txt` criado (opcional)

---

## 🆘 Problemas Comuns

### Bot não inicia

**Verifique logs na plataforma:**
- Render: Aba "Logs"
- Railway: Aba "Deployments" → "View Logs"
- Heroku: `heroku logs --tail`

**Causa comum:** Variável `ANTHROPIC_API_KEY` não configurada

### Webhook não funciona

**Teste se bot está acessível:**
```bash
curl https://sua-url.com/health
```

**Configure URL correta no Evolution/Twilio:**
- Certifique-se de usar HTTPS
- Adicione `/webhook` no final

### Bot dorme (Render grátis)

**Soluções:**
1. Upgrade para plano pago ($7/mês)
2. Use serviço de ping: https://uptimerobot.com (grátis)
3. Migre para Railway ($5/mês, nunca dorme)

---

## 📞 Próximos Passos Após Deploy

1. ✅ Bot online e respondendo
2. 🔗 Configure webhook no Evolution/Twilio
3. 📱 Teste enviando mensagem real para 555195251053
4. 📊 Monitore estatísticas: `https://sua-url.com/stats`
5. 📝 Verifique logs da plataforma
6. 👥 Notifique o time (Diogo e Team Bear)
7. 🎉 Comece a vender imóveis!

---

**🚀 Em menos de 10 minutos seu bot estará NA WEB!**

**Bot:** grayce - HRR Imóveis - Team Bear
**Desenvolvido com:** CREAO Platform
**🏠 Realizando o sonho da casa própria! 💙**
