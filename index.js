const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } = require('baileys');
const Anthropic = require('@anthropic-ai/sdk');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const CONHECIMENTO = require('./conhecimento');

const CONFIG = {
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  AUDIOS_DIR: path.join(__dirname, 'audios'),
  AUTH_DIR:   path.join(__dirname, 'auth'),
  DATA_DIR:   path.join(__dirname, 'data'),
};

const AUDIO_MAP = {
  '1_contato': '1__contato.ogg',
  'explicar':  'explicar.ogg',
  'clt':       'clt.ogg',
  'autonomo':  'autonomo.ogg',
  'parabens':  'parabéns.ogg',
};

// ─── DATA ───────────────────────────────────────
function readDB(file) {
  const p = path.join(CONFIG.DATA_DIR, file);
  try { if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8')); } catch(e) {}
  return {};
}
function writeDB(file, data) {
  if (!fs.existsSync(CONFIG.DATA_DIR)) fs.mkdirSync(CONFIG.DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(CONFIG.DATA_DIR, file), JSON.stringify(data, null, 2), 'utf8');
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

let anthropic;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── PROMPT ──────────────────────────────────────
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

Personalidade: direta, confiante, calorosa, um pouco provocativa no bom sentido. Age como colega sênior que quer que todos vençam.

PESSOA: ${pessoa.nome} | Tipo: ${pessoa.tipo} | Perfil: ${JSON.stringify(pessoa.perfil)}
MEMÓRIA: ${memoriaStr}

VOCÊ DETECTA AUTOMATICAMENTE quem é:
- Fala profissional, pergunta sobre empreendimentos/fluxos/clientes → TIME
- Busca imóvel, pergunta sobre programa/parcela → CLIENTE  
- Dúvida → PERGUNTA naturalmente, sem parecer robô

VOCÊ NÃO ESPERA COMANDOS. Você age, pergunta, inicia.
Quando alguém novo chega, se apresenta e pergunta quem é.
Para TIME: treina, simula clientes, dá feedback, motiva, responde dúvidas técnicas.
Para CLIENTE: qualifica naturalmente, avança no funil, usa áudio nos momentos certos.

EMPREENDIMENTOS:
${empStr}

TIPOLOGIAS E PREÇOS:
${tipStr}

FLUXOS CLT:
• 0-10%: Tipo1=22x mín 50% CEF | Tipo2=11x R$366,66 | Pós Chave=36x mín R$250 | Sem balão
• 10-15%: Tipo1=22x mín 70% | Tipo2=11x R$366,66 | Balões máx 70%
• 15-25%: Tipo1=22x mín 80% | Tipo2=11x máx 60% | Balões máx 70%

FLUXOS MISTAS/INFORMAIS: igual CLT mas Balões máx 55% nas faixas 10-15% e 15-25%
⚠️ SEMPRE reduzir pós chave primeiro

DOCUMENTOS CLT: ${CONHECIMENTO.documentos.CLT.join(' | ')}
DOCUMENTOS AUTÔNOMO: ${CONHECIMENTO.documentos.AUTONOMO.join(' | ')}

OBJEÇÕES:
${objecoesStr}

FORMATO — responda SEMPRE em JSON:
{
  "texto": "sua mensagem",
  "audio": "1_contato|explicar|clt|autonomo|parabens|nenhum",
  "atualizar_tipo": "time|cliente|desconhecido|mesma",
  "atualizar_perfil": {},
  "memorizar": "frase curta ou null"
}

ÁUDIO: parabens SOMENTE quando aprovado pela Caixa. nenhum para time e perguntas.`;
}

// ─── CLAUDE ──────────────────────────────────────
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
      for (const [k,v] of Object.entries(parsed.atualizar_perfil)) {
        if (v) pessoa.perfil[k] = v;
      }
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

// ─── ENVIO ───────────────────────────────────────
async function enviarAudio(sock, jid, key) {
  if (!key || key === 'nenhum') return;
  const file = AUDIO_MAP[key];
  if (!file) return;
  const p = path.join(CONFIG.AUDIOS_DIR, file);
  if (!fs.existsSync(p)) return;
  try {
    await sock.sendPresenceUpdate('recording', jid);
    await sleep(1500);
    await sock.sendMessage(jid, { audio: fs.readFileSync(p), mimetype:'audio/ogg; codecs=opus', ptt:true });
    await sock.sendPresenceUpdate('paused', jid);
    console.log(`🎙️  ${file}`);
  } catch(e) { console.error('❌ Áudio:', e.message); }
}

async function enviarTexto(sock, jid, texto) {
  if (!texto?.trim()) return;
  try {
    await sock.sendPresenceUpdate('composing', jid);
    await sleep(Math.min(texto.length * 20, 3000));
    await sock.sendMessage(jid, { text: texto });
    await sock.sendPresenceUpdate('paused', jid);
    console.log(`💬 ${texto.substring(0,80)}`);
  } catch(e) { console.error('❌ Texto:', e.message); }
}

// ─── PROCESSAR ───────────────────────────────────
async function processarMensagem(sock, msg) {
  const jid = msg.key.remoteJid;
  if (msg.key.fromMe) return;
  if (jid.endsWith('@g.us')) return;
  const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
  if (!texto.trim()) return;
  const nome = msg.pushName || jid.split('@')[0];
  const pessoa = getPessoa(jid, nome);
  pessoa.nome = nome;
  console.log(`\n📩 [${nome}|${pessoa.tipo}]: ${texto.substring(0,80)}`);
  if (!CONFIG.ANTHROPIC_API_KEY) { console.error('❌ API Key não configurada!'); return; }
  const resp = await chamarGrayce(pessoa, texto);
  if (resp.audio && resp.audio !== 'nenhum') { await enviarAudio(sock, jid, resp.audio); await sleep(800); }
  if (resp.texto) await enviarTexto(sock, jid, resp.texto);
}

// ─── BOOT ────────────────────────────────────────
let isConnecting = false;

async function iniciarBot() {
  if (isConnecting) return;
  isConnecting = true;

  if (!fs.existsSync(CONFIG.DATA_DIR)) fs.mkdirSync(CONFIG.DATA_DIR, { recursive: true });
  if (!fs.existsSync(CONFIG.AUTH_DIR)) fs.mkdirSync(CONFIG.AUTH_DIR, { recursive: true });

  console.log('\n🎵 Áudios:');
  for (const [k,f] of Object.entries(AUDIO_MAP)) {
    console.log(`   ${fs.existsSync(path.join(CONFIG.AUDIOS_DIR,f))?'✅':'❌'} ${k}`);
  }
  console.log(`📚 ${CONHECIMENTO.empreendimentos.length} empreendimentos`);

  anthropic = new Anthropic({ apiKey: CONFIG.ANTHROPIC_API_KEY });

  const logger = pino({ level: 'silent' });
  const { state, saveCreds } = await useMultiFileAuthState(CONFIG.AUTH_DIR);

  const sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    logger,
    printQRInTerminal: false,
    browser: ['Grayce', 'Safari', '1.0'],
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: undefined,
    keepAliveIntervalMs: 30000,
    emitOwnEvents: false,
    fireInitQueries: true,
    generateHighQualityLinkPreview: false,
    syncFullHistory: false,
    markOnlineOnConnect: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.clear();
      console.log('\n╔══════════════════════════════════╗');
      console.log('║  GRAYCE — Escaneie com WhatsApp  ║');
      console.log('╚══════════════════════════════════╝\n');
      qrcode.generate(qr, { small: true });
      console.log('\nWhatsApp > Aparelhos Conectados > Conectar\n');
    }

    if (connection === 'open') {
      isConnecting = false;
      console.log('\n✅ GRAYCE CONECTADA!\n');
    }

    if (connection === 'close') {
      isConnecting = false;
      const code = lastDisconnect?.error?.output?.statusCode;
      const loggedOut = code === DisconnectReason.loggedOut || code === 401;
      if (loggedOut) {
        console.log('❌ Sessão expirada. Deletando auth e reiniciando...');
        fs.rmSync(CONFIG.AUTH_DIR, { recursive: true, force: true });
      } else {
        console.log(`🔄 Reconectando em 5s... (código: ${code})`);
      }
      setTimeout(iniciarBot, 5000);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) await processarMensagem(sock, msg);
  });
}

iniciarBot().catch(err => {
  console.error('Erro fatal:', err.message);
  isConnecting = false;
  setTimeout(iniciarBot, 5000);
});
