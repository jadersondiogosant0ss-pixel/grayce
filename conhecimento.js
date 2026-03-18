// ═══════════════════════════════════════════════
// BASE DE CONHECIMENTO DA GRAYCE - TEAM BEAR
// ═══════════════════════════════════════════════

const CONHECIMENTO = {

  // ─── EMPREENDIMENTOS ──────────────────────────
  empreendimentos: [
    { nome: "SALT LAKE II",     entrega: "20/03/2028", parcelamento: 24, primeira_parcela: "abr/26" },
    { nome: "SALT LAKE I",      entrega: "20/04/2027", parcelamento: 14, primeira_parcela: "abr/26" },
    { nome: "AVALON",           entrega: "20/04/2027", parcelamento: 21, primeira_parcela: "abr/26" },
    { nome: "FOUNTAIN",         entrega: "20/04/2027", parcelamento: 21, primeira_parcela: "abr/26" },
    { nome: "BROOKLYN",         entrega: "20/04/2027", parcelamento: 21, primeira_parcela: "abr/26" },
    { nome: "SAN BERNARDINO I", entrega: "20/04/2027", parcelamento:  9, primeira_parcela: "abr/26" },
    { nome: "SAN BERNARDINO II",entrega: "20/04/2027", parcelamento:  9, primeira_parcela: "abr/26" },
    { nome: "OMAHA III",        entrega: "20/02/2027", parcelamento:  6, primeira_parcela: "abr/26" },
    { nome: "OMAHA II",         entrega: "20/02/2027", parcelamento:  6, primeira_parcela: "abr/26" },
    { nome: "OMAHA I",          entrega: "20/02/2027", parcelamento:  6, primeira_parcela: "abr/26" },
    { nome: "RENO",             entrega: "20/07/2027", parcelamento: 11, primeira_parcela: "abr/26" },
    { nome: "KENTUCKY I",       entrega: "20/10/2027", parcelamento: 21, primeira_parcela: "abr/26" },
    { nome: "KENTUCKY II",      entrega: "20/10/2027", parcelamento: 22, primeira_parcela: "abr/26" },
    { nome: "KENTUCKY III",     entrega: "20/10/2027", parcelamento: 23, primeira_parcela: "abr/26" },
    { nome: "BROADWAY I",       entrega: "20/05/2028", parcelamento: 23, primeira_parcela: "abr/26" },
    { nome: "BROADWAY II",      entrega: "20/11/2028", parcelamento: 26, primeira_parcela: "abr/26" },
    { nome: "HIGH POINT",       entrega: "20/08/2028", parcelamento: 24, primeira_parcela: "abr/26" },
    { nome: "CONCORD",          entrega: "20/07/2028", parcelamento: 24, primeira_parcela: "abr/26" },
    { nome: "LOUISVILLE",       entrega: "20/10/2028", parcelamento: 25, primeira_parcela: "abr/26" },
    { nome: "PALM COAST I",     entrega: "20/01/2029", parcelamento: 29, primeira_parcela: "abr/26" },
    { nome: "PALM COAST II",    entrega: "20/01/2029", parcelamento: 29, primeira_parcela: "abr/26" },
    { nome: "BLUE LAKE I",      entrega: "20/04/2029", parcelamento: 32, primeira_parcela: "abr/26" },
    { nome: "LAKEWOOD",         entrega: "20/07/2029", parcelamento: 33, primeira_parcela: "abr/26" },
    { nome: "JERSEY VILLAGE",   entrega: "20/07/2029", parcelamento: 33, primeira_parcela: "abr/26" },
  ],

  // ─── TIPOLOGIAS E PREÇOS ──────────────────────
  tipologias: {
    "JERSEY VILLAGE": {
      docs: 10315,
      tipos: [
        { tipo: "Apartamento (TIPO)",                                          avaliacao: 230000, venda: 216000, promocional: 202150, qtd_promo: 20 },
        { tipo: "Apartamento Sacada com Churrasqueira",                        avaliacao: 242000, venda: 225000, promocional: 215000, qtd_promo: 20 },
        { tipo: "Garden Simples 6,55m²",                                       avaliacao: 230000, venda: 216000, promocional: 220000, qtd_promo: 30 },
        { tipo: "Varanda 12,79m²",                                             avaliacao: 230000, venda: 216000 },
        { tipo: "Garden Duplo 6,55m² + Varanda 12,68m²",                       avaliacao: 230000, venda: 230000, promocional: 230000, qtd_promo: 8 },
        { tipo: "Garden 12,68 + Varanda de 12,79",                             avaliacao: 242000, venda: 230000, promocional: 230000, qtd_promo: 8 },
        { tipo: "Garden duplo 6,55m² + 10,68m² Sacada com Churraspeira",       avaliacao: 242000, venda: 252000, promocional: 245000, qtd_promo: 6 },
        { tipo: "Garden 10,68 + Varanda 12,79m² + sacada com churrasqueira",   avaliacao: 242000, venda: 252000, promocional: 245000, qtd_promo: 6 },
      ]
    },
    "BLUE LAKE I": {
      docs: 8850,
      tipos: [
        { tipo: "Apartamento (TIPO)",                         avaliacao: 236000, venda: 215000 },
        { tipo: "Apartamento (PNE) + Garden Padrão 6,49m²",  avaliacao: 236000, venda: 218000 },
        { tipo: "Apartamento (PNE) + Varanda 16,46m²",       avaliacao: 236000, venda: 218000 },
        { tipo: "Garden Duplo 6,55m² + Varanda 12,68m²",     avaliacao: 236000, venda: 225000 },
        { tipo: "Garden 12,68 + Varanda de 12,79",           avaliacao: 236000, venda: 225000 },
      ]
    },
    "BROOKLYN": {
      docs: 10315,
      tipos: [
        { tipo: "Apartamento (TIPO)",                                        avaliacao: 255000, venda: 220000 },
        { tipo: "Apartamento Sacada com Churrasqueira",                      avaliacao: 255000, venda: 227000 },
        { tipo: "Garden Simples 6,55m²",                                     avaliacao: 255000, venda: 229000 },
        { tipo: "Varanda 12,79m²",                                           avaliacao: 255000, venda: 229000 },
        { tipo: "Garden duplo 6,55m² + 12,68m²",                             avaliacao: 255000, venda: 235000 },
        { tipo: "Garden 12,68m² + Varanda de 12,79m²",                       avaliacao: 255000, venda: 235000 },
        { tipo: "Garden dublo 6,55m² + 10,68m² + Sacada com Churrasqueira",  avaliacao: 255000, venda: 240000 },
        { tipo: "Garden 10,68m² + Varanda 12,79m² + sacada com churrasqueira",avaliacao: 255000, venda: 240000 },
      ]
    }
  },

  // ─── FLUXOS DE PAGAMENTO ──────────────────────
  fluxos: {
    CLT: {
      "0 a 10%": {
        tipo1: "22x de mínimo 50% da parcela CEF",
        tipo2: "11x de R$366,66",
        pos_chave: "36x de R$366,66 mínimo R$250,00",
        balao: "Sem balão"
      },
      "10,01 a 15%": {
        tipo1: "22x de mínimo 70% da parcela CEF",
        tipo2: "11x de R$366,66",
        pos_chave: "36x de R$366,66 mínimo R$250,00",
        balao: "Balões em no máximo 70%"
      },
      "15,01 a 25%": {
        tipo1: "22x de mínimo 80% da parcela CEF",
        tipo2: "11x de máximo 60% da parcela CEF",
        pos_chave: "36x de R$366,66 mínimo R$250,00",
        balao: "Balões em no máximo 70%"
      }
    },
    MISTAS_INFORMAIS: {
      "0 a 10%": {
        tipo1: "22x de mínimo 50% da parcela CEF",
        tipo2: "11x de R$366,66",
        pos_chave: "36x de R$366,66 mínimo R$250,00",
        balao: "Sem balão"
      },
      "10,01 a 15%": {
        tipo1: "22x de mínimo 70% da parcela CEF",
        tipo2: "11x de R$366,66",
        pos_chave: "36x de R$366,66 mínimo R$250,00",
        balao: "Balões em no máximo 55%"
      },
      "15,01 a 25%": {
        tipo1: "22x de mínimo 80% da parcela CEF",
        tipo2: "11x de máximo 60% da parcela CEF",
        pos_chave: "36x de R$366,66 mínimo R$250,00",
        balao: "Balões em no máximo 55%"
      }
    },
    regra_pos_chave: "SEMPRE reduzir primeiro o pós chave e só então atualizar o pré chaves",
    lancamento_sem_mensal_dezembro: {
      "8x Tipo 1": "Primeira parcela para Abril 2026",
      "11x Tipo 1": "Primeira parcela para Janeiro 2027",
      "3x Tipo 1": "Primeira parcela para Janeiro 2028"
    }
  },

  // ─── OBJEÇÕES ─────────────────────────────────
  objecoes: {
    "QUAL A LOCALIZAÇÃO?": "Temos empreendimentos em toda Porto Alegre e região metropolitana. Para mostrar as opções certas, preciso fazer uma análise de crédito rápida primeiro.",
    "QUAL O VALOR DA PARCELA?": "Para informar o valor exato da parcela precisamos da análise de crédito. Mas posso te mostrar os fluxos disponíveis!",
    "TEM QUE DAR ENTRADA?": "Depende da aprovação. Em alguns casos não precisa. Se precisar, parcelamos a entrada em até 84x ou usamos o FGTS.",
    "TAXA DE JUROS?": "As taxas do MCMV variam de 4,25% a 7% ao ano. Bem abaixo do mercado que começa em 9,99%.",
    "PAROU DE RESPONDER": "Seu cadastro tem validade até amanhã pela manhã. Caso não retorne, serei obrigada a desligar o cadastro.",
    "RESTRIÇÃO NO NOME": "Depende do tipo e tamanho da restrição. Tem alguém com nome limpo que possa fazer a análise junto?",
    "PARCELA ALTA": "Essa parcela não é gasto, é investimento! O imóvel valoriza em média 12,5% ao ano. Diferente do aluguel, cada pagamento aumenta seu patrimônio.",
    "NAO QUERO": "Entendo, mas se você se inscreveu é porque teve interesse. O que te fez mudar de ideia?",
    "JA COMPREI": "Que legal! Parabéns! Comprou por qual imobiliária? Já assinou na Caixa?",
    "JUROS DE OBRA": "Pense nos juros de obra como garantia que a construção chegue no prazo. E o imóvel valoriza 12,5% ao ano durante a obra.",
  },

  // ─── DOCUMENTOS NECESSÁRIOS ───────────────────
  documentos: {
    CLT: ["RG ou CNH", "CPF", "Comprovante de residência", "Holerite dos últimos 3 meses", "Carteira de trabalho (páginas de identificação e último emprego)", "Extrato do FGTS"],
    AUTONOMO: ["RG ou CNH", "CPF", "Comprovante de residência", "Extrato bancário dos últimos 6 meses", "Declaração de imposto de renda (DECORE ou declaração de próprio punho)", "Comprovante de atividade (contrato de prestação de serviços, notas fiscais, etc)"]
  },

  // ─── SCRIPT DE VENDAS ─────────────────────────
  script: {
    abertura: "Oi [nome]! Tudo bem? Me chamo Grayce e trabalho com o programa Minha Casa Minha Vida. Recebi seu pré-cadastro querendo saber mais sobre o programa, vou te explicar como funciona, ok? 😊",
    qualificacao: ["Qual é sua idade?", "Estado civil?", "Tem dependentes?", "É registrado em carteira de trabalho ou autônomo? Há quanto tempo?"],
    aprovacao: "[Nome], você foi aprovado! 🎉 Aqui no meu sistema está VERDE — aprovação boa em condição de compra. A Caixa libera os detalhes na sua presença por causa da LGPD. Próximo passo: marcar uma visita ao escritório!"
  }
};

module.exports = CONHECIMENTO;
