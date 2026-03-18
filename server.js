const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } = require('baileys');
const Anthropic = require('@anthropic-ai/sdk');
const QRCode = require('qrcode');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const CONHECIMENTO = require('./conhecimento');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const AUTH_DIR = path.join(__dirname, 'auth');
const AUDIOS_DIR = path.join(__dirname, 'audios');

const AUDIO_MAP = {
  '1_contato': '1__contato.ogg',
  'explicar':  'explicar.ogg',
  'clt':       'clt.ogg',
  'autonomo':  'autonomo.ogg',
  'parabens':  'parabéns.ogg',
};

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

// ─── DATA ─────────────────────────────────────────
function readDB(file) {
  const p = path.join(DATA_DIR, file);
  try { if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8')); } catch(e) {}
  return {};
}
function writeDB(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf8');
}
function getPessoa(jid, nome) {
  const db = readDB('pessoas.json');
  if (!db[jid]) db[jid] = { jid, nome, tipo:'desconhecido', perfil:{}, memoria:[], historico:[], criadoEm: new Date().toISOString() };
  writeDB('pessoas.json', db);
  return db[jid];
}
function savePessoa(p) {
  const db = readDB('pessoas.json');
  db[p.jid] = { ...p, atualizadoEm: new Date().toISOString() };
  writeDB('pessoas.json', db);
}

// ─── ESTADO GLOBAL ─────────────────────────────────
let grayceStatus = 'desconectada';
let qrCodeData = null;
let anthropic;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── PROMPT ────────────────────────────────────────
function buildPrompt(pessoa) {
  const empStr = CONHECIMENTO.empreendimentos.map(e =>
    `• ${e.nome}: entrega ${e.entrega} | ${e.parcelamento}x obra | 1ª parcela ${e.primeira_parcela}`
  ).join('\n');

  const tipStr = Object.entries(CONHECIMENTO.tipologias).map(([nome, data]) =>
    `${nome}:\n` + data.tipos.map(t =>
      `  · ${t.tipo}: R$${t.venda.toLocaleString('pt-BR')}${t.promocional ? ` | PROMO R$${t.promocional.toLocaleString('pt-BR')}` : ''}`
    ).join('\n')
  ).join('\n\n');

  const objecoesStr = Object.entries(CONHECIMENTO.objecoes).map(([o,r]) => `• ${o} → ${r}`).join('\n');
  const memoriaStr = pessoa.memoria.length ? pessoa.memoria.slice(-10).map(m=>`- ${m}`).join('\n') : 'nenhuma';

  return `Você é a Grayce — sub-gerente comercial e agente IA do Team Bear. Especialista em Minha Casa Minha Vida.

Personalidade: direta, confiante, calorosa, levemente provocativa no bom sentido. Age como colega sênior que genuinamente quer que todos vençam.

PESSOA: ${pessoa.nome} | Tipo: ${pessoa.tipo} | Perfil: ${JSON.stringify(pessoa.perfil)}
MEMÓRIA: ${memoriaStr}

DETECTA AUTOMATICAMENTE:
- Fala profissional, pergunta sobre empreendimentos/fluxos/clientes → TIME
- Busca imóvel, pergunta sobre programa/parcela → CLIENTE
- Dúvida → pergunta naturalmente

NÃO ESPERA COMANDOS. Age, pergunta, inicia.
Para TIME: treina, simula clientes difíceis, dá feedback real, motiva, responde técnico.
Para CLIENTE: qualifica naturalmente, avança no funil, usa áudio nos momentos certos.

EMPREENDIMENTOS:
${empStr}

TIPOLOGIAS:
${tipStr}

FLUXOS CLT: 0-10%: T1=22x mín 50% CEF | T2=11x R$366,66 | Pós=36x mín R$250 | Sem balão
10-15%: T1=22x mín 70% | T2=11x | Balões máx 70% | 15-25%: T1=22x mín 80% | T2=11x máx 60% | Balões máx 70%
MISTAS: igual CLT mas Balões máx 55% | ⚠️ SEMPRE reduzir pós chave primeiro

DOCUMENTOS CLT: ${CONHECIMENTO.documentos.CLT.join(' | ')}
DOCUMENTOS AUTÔNOMO: ${CONHECIMENTO.documentos.AUTONOMO.join(' | ')}

OBJEÇÕES:
${objecoesStr}

RESPONDA EM JSON:
{"texto":"msg","audio":"1_contato|explicar|clt|autonomo|parabens|nenhum","atualizar_tipo":"time|cliente|desconhecido|mesma","atualizar_perfil":{},"memorizar":"frase ou null"}

ÁUDIO: parabens SÓ quando aprovado pela Caixa. nenhum para time e perguntas.`;
}

// ─── CLAUDE ────────────────────────────────────────
async function chamarGrayce(pessoa, mensagem) {
  pessoa.historico.push({ role:'user', content: mensagem });
  if (pessoa.historico.length > 30) pessoa.historico = pessoa.historico.slice(-30);
  try {
    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514', max_tokens: 600,
      system: buildPrompt(pessoa),
      messages: pessoa.historico.slice(-20)
    });
    const match = res.content[0].text.trim().match(/\{[\s\S]*\}/);
    if (!match) throw new Error('sem JSON');
    const parsed = JSON.parse(match[0]);
    pessoa.historico.push({ role:'assistant', content: parsed.texto });
    if (parsed.atualizar_tipo && parsed.atualizar_tipo !== 'mesma') pessoa.tipo = parsed.atualizar_tipo;
    if (parsed.atualizar_perfil) {
      for (const [k,v] of Object.entries(parsed.atualizar_perfil)) { if (v) pessoa.perfil[k] = v; }
    }
    if (parsed.memorizar) {
      pessoa.memoria.push(parsed.memorizar);
      if (pessoa.memoria.length > 50) pessoa.memoria = pessoa.memoria.slice(-50);
    }
    savePessoa(pessoa);
    return parsed;
  } catch(e) {
    console.error('❌ Claude:', e.message);
    return { texto:'Oi! Pode falar 😊', audio:'nenhum', atualizar_tipo:'mesma', atualizar_perfil:{}, memorizar:null };
  }
}

// ─── WHATSAPP ──────────────────────────────────────
let sock;
let isConnecting = false;

async function enviarAudio(jid, key) {
  if (!key || key === 'nenhum') return;
  const file = AUDIO_MAP[key];
  if (!file) return;
  const p = path.join(AUDIOS_DIR, file);
  if (!fs.existsSync(p)) return;
  try {
    await sock.sendPresenceUpdate('recording', jid);
    await sleep(1500);
    await sock.sendMessage(jid, { audio: fs.readFileSync(p), mimetype:'audio/ogg; codecs=opus', ptt:true });
    await sock.sendPresenceUpdate('paused', jid);
  } catch(e) { console.error('❌ Áudio:', e.message); }
}

async function enviarTexto(jid, texto) {
  if (!texto?.trim()) return;
  try {
    await sock.sendPresenceUpdate('composing', jid);
    await sleep(Math.min(texto.length * 20, 3000));
    await sock.sendMessage(jid, { text: texto });
    await sock.sendPresenceUpdate('paused', jid);
  } catch(e) { console.error('❌ Texto:', e.message); }
}

async function processarMensagem(msg) {
  const jid = msg.key.remoteJid;
  if (msg.key.fromMe) return;
  if (jid.endsWith('@g.us')) return;
  const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
  if (!texto.trim()) return;
  const nome = msg.pushName || jid.split('@')[0];
  const pessoa = getPessoa(jid, nome);
  pessoa.nome = nome;

  console.log(`📩 [${nome}]: ${texto.substring(0,60)}`);
  io.emit('nova_mensagem', { de: nome, texto: texto.substring(0,100), tipo: pessoa.tipo, hora: new Date().toLocaleTimeString('pt-BR') });

  if (!process.env.ANTHROPIC_API_KEY) return;
  const resp = await chamarGrayce(pessoa, texto);
  if (resp.audio && resp.audio !== 'nenhum') { await enviarAudio(jid, resp.audio); await sleep(800); }
  if (resp.texto) await enviarTexto(jid, resp.texto);

  io.emit('resposta_grayce', { para: nome, texto: resp.texto.substring(0,100), audio: resp.audio, hora: new Date().toLocaleTimeString('pt-BR') });
}

async function conectarWhatsApp() {
  if (isConnecting) return;
  isConnecting = true;

  const logger = pino({ level: 'silent' });
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  sock = makeWASocket({
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) },
    logger,
    printQRInTerminal: false,
    browser: ['Grayce', 'Safari', '1.0'],
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: undefined,
    keepAliveIntervalMs: 30000,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      grayceStatus = 'aguardando_qr';
      qrCodeData = await QRCode.toDataURL(qr);
      io.emit('qr', qrCodeData);
      io.emit('status', 'aguardando_qr');
      console.log('📱 QR Code gerado');
    }
    if (connection === 'open') {
      isConnecting = false;
      grayceStatus = 'conectada';
      qrCodeData = null;
      io.emit('status', 'conectada');
      console.log('✅ Grayce conectada!');
    }
    if (connection === 'close') {
      isConnecting = false;
      grayceStatus = 'desconectada';
      io.emit('status', 'desconectada');
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code === DisconnectReason.loggedOut || code === 401) {
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        fs.mkdirSync(AUTH_DIR, { recursive: true });
      }
      setTimeout(conectarWhatsApp, 5000);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) await processarMensagem(msg);
  });
}

// ─── WEB INTERFACE ─────────────────────────────────
app.get('/', (req, res) => {
  const leads = readDB('pessoas.json');
  const total = Object.keys(leads).length;
  const time = Object.values(leads).filter(p => p.tipo === 'time').length;
  const clientes = Object.values(leads).filter(p => p.tipo === 'cliente').length;

  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Grayce — Team Bear</title>
<script src="/socket.io/socket.io.js"></script>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: 'Segoe UI', sans-serif; background:#0a0f1a; color:#e8f0f8; min-height:100vh; }

.header {
  background: linear-gradient(135deg, #0f2027, #1a3a2a);
  border-bottom: 1px solid #00c98d33;
  padding: 20px 32px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.avatar {
  width: 52px; height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1a3a2a, #0f2027);
  border: 2px solid #00c98d;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 800; color: #00c98d;
  font-family: 'Segoe UI', sans-serif;
}
.header-info h1 { font-size: 20px; font-weight: 700; color:#fff; }
.header-info p { font-size: 12px; color: #00c98d; margin-top:2px; }
.status-badge {
  margin-left: auto;
  display: flex; align-items: center; gap: 8px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px; font-weight: 600;
  background: #0f1923;
  border: 1px solid #21262d;
}
.status-dot { width:8px; height:8px; border-radius:50%; }
.dot-verde { background:#4ade80; box-shadow:0 0 6px #4ade80; }
.dot-amarelo { background:#fbbf24; box-shadow:0 0 6px #fbbf24; animation: blink 1s infinite; }
.dot-vermelho { background:#ef4444; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

.body { padding: 28px 32px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

.card {
  background: #0f1923;
  border: 1px solid #1e2d42;
  border-radius: 14px;
  padding: 20px;
}
.card h3 { font-size: 11px; color:#4a6a8a; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }
.card .val { font-size: 32px; font-weight: 700; color:#00c98d; }
.card .sub { font-size: 11px; color:#4a6a8a; margin-top:4px; }

.qr-section {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px;
}
.qr-section img { border-radius: 12px; border: 3px solid #00c98d; }
.qr-section p { font-size: 14px; color:#8b949e; text-align:center; }

.log-section {
  grid-column: 1 / -1;
}
.log-box {
  background: #060d14;
  border: 1px solid #1e2d42;
  border-radius: 10px;
  padding: 14px;
  height: 240px;
  overflow-y: auto;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  line-height: 1.8;
}
.log-box::-webkit-scrollbar { width:4px; }
.log-box::-webkit-scrollbar-thumb { background:#1e2d42; }
.log-in { color:#00c98d; }
.log-out { color:#4a9eff; }
.log-info { color:#4a6a8a; }

.reconectar-btn {
  padding: 12px 28px;
  background: #00c98d;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px; font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}
.reconectar-btn:hover { background: #009e6e; }

.connected-msg {
  grid-column: 1 / -1;
  text-align: center;
  padding: 32px;
  color: #00c98d;
  font-size: 18px;
  font-weight: 600;
}
</style>
</head>
<body>

<div class="header">
  <div class="avatar">G</div>
  <div class="header-info">
    <h1>Grayce ✦</h1>
    <p>Sub-Gerente IA — Team Bear MCMV</p>
  </div>
  <div class="status-badge">
    <div class="status-dot" id="statusDot"></div>
    <span id="statusTxt">Carregando...</span>
  </div>
</div>

<div class="body">
  <div class="card">
    <h3>Total de contatos</h3>
    <div class="val">${total}</div>
    <div class="sub">no banco de dados</div>
  </div>
  <div class="card">
    <h3>Time</h3>
    <div class="val">${time}</div>
    <div class="sub">corretores ativos</div>
  </div>
  <div class="card">
    <h3>Clientes</h3>
    <div class="val">${clientes}</div>
    <div class="sub">leads atendidos</div>
  </div>

  <div id="qrArea" class="qr-section" style="display:none;">
    <p>📱 Escaneie o QR Code com seu WhatsApp<br>Aparelhos Conectados → Conectar Aparelho</p>
    <img id="qrImg" src="" alt="QR Code" width="260">
    <p style="font-size:11px;color:#4a6a8a;">O QR Code atualiza automaticamente</p>
  </div>

  <div id="connectedArea" class="connected-msg" style="display:none;">
    ✅ Grayce conectada e atendendo no WhatsApp!
  </div>

  <div class="log-section">
    <div class="card" style="padding:0;overflow:hidden;">
      <div style="padding:14px 16px;border-bottom:1px solid #1e2d42;font-size:11px;color:#4a6a8a;text-transform:uppercase;letter-spacing:1px;">Atividade em tempo real</div>
      <div class="log-box" id="logBox">
        <div class="log-info">Aguardando atividade...</div>
      </div>
    </div>
  </div>
</div>

<script>
const socket = io();
const statusDot = document.getElementById('statusDot');
const statusTxt = document.getElementById('statusTxt');
const qrArea = document.getElementById('qrArea');
const qrImg = document.getElementById('qrImg');
const connectedArea = document.getElementById('connectedArea');
const logBox = document.getElementById('logBox');

function addLog(msg, tipo) {
  const div = document.createElement('div');
  div.className = 'log-' + tipo;
  const hora = new Date().toLocaleTimeString('pt-BR');
  div.textContent = '[' + hora + '] ' + msg;
  logBox.appendChild(div);
  logBox.scrollTop = logBox.scrollHeight;
}

socket.on('status', (s) => {
  if (s === 'conectada') {
    statusDot.className = 'status-dot dot-verde';
    statusTxt.textContent = 'Online';
    qrArea.style.display = 'none';
    connectedArea.style.display = 'block';
    addLog('Grayce conectada ao WhatsApp!', 'in');
  } else if (s === 'aguardando_qr') {
    statusDot.className = 'status-dot dot-amarelo';
    statusTxt.textContent = 'Aguardando QR';
    qrArea.style.display = 'flex';
    connectedArea.style.display = 'none';
  } else {
    statusDot.className = 'status-dot dot-vermelho';
    statusTxt.textContent = 'Desconectada';
    addLog('Grayce desconectada. Reconectando...', 'info');
  }
});

socket.on('qr', (data) => {
  qrImg.src = data;
  qrArea.style.display = 'flex';
  addLog('Novo QR Code gerado — escaneie agora!', 'info');
});

socket.on('nova_mensagem', (d) => {
  addLog('📩 [' + d.de + ']: ' + d.texto, 'in');
});

socket.on('resposta_grayce', (d) => {
  addLog('💬 → [' + d.para + ']: ' + d.texto + (d.audio !== 'nenhum' ? ' 🎙️ ' + d.audio : ''), 'out');
});

// Checar status atual
fetch('/api/status').then(r => r.json()).then(d => {
  socket.emit('get_status');
  if (d.status === 'conectada') {
    statusDot.className = 'status-dot dot-verde';
    statusTxt.textContent = 'Online';
    connectedArea.style.display = 'block';
  } else if (d.qr) {
    statusDot.className = 'status-dot dot-amarelo';
    statusTxt.textContent = 'Aguardando QR';
    qrImg.src = d.qr;
    qrArea.style.display = 'flex';
  } else {
    statusDot.className = 'status-dot dot-vermelho';
    statusTxt.textContent = 'Conectando...';
  }
});
</script>
</body>
</html>`);
});

app.get('/api/status', (req, res) => {
  res.json({ status: grayceStatus, qr: qrCodeData });
});

app.get('/api/leads', (req, res) => {
  res.json(readDB('pessoas.json'));
});

// ─── SOCKET ────────────────────────────────────────
io.on('connection', (socket) => {
  socket.emit('status', grayceStatus);
  if (qrCodeData) socket.emit('qr', qrCodeData);
});

// ─── START ─────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n🌐 Grayce rodando em http://localhost:${PORT}`);
  console.log(`📊 Dashboard disponível no navegador\n`);
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "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"
  setTimeout(conectarWhatsApp, 1000);
});
