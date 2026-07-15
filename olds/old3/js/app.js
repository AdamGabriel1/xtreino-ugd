const CSV_URL = "./data/campeonato.csv";

let bancoCompleto = [];
let rankingAtual = [];

/* =========================================
   CONFIG
========================================= */

const CONFIG = {
  campeonato: "DEVILS MOBILE LEAGUE",
  plataforma: "MOBILE",
  modo: "SQUAD",
  quedas: 3,
  mapa: "ILHA DO MEDO",
  organizador: "DEVILS"
};

/* =========================================
   START
========================================= */

document.addEventListener("DOMContentLoaded", async () => {
  await carregarCSV();
  iniciarBusca();
});

/* =========================================
   MENU MOBILE
========================================= */

function toggleMobileMenu() {
  document
    .getElementById("mobileMenu")
    .classList.toggle("hidden");
}

/* =========================================
   NAVEGAÇÃO
========================================= */

function switchPage(page) {

  document
    .querySelectorAll(".page-section")
    .forEach(sec => sec.classList.add("hidden"));

  document
    .getElementById(`page-${page}`)
    .classList.remove("hidden");

  document
    .querySelectorAll(".nav-btn")
    .forEach(btn => btn.classList.remove("active"));

  const navs = document.querySelectorAll(".nav-btn");

  if (page === "home") navs[0].classList.add("active");
  if (page === "ranking") navs[1].classList.add("active");
  if (page === "times") navs[2].classList.add("active");

  document
    .getElementById("mobileMenu")
    .classList.add("hidden");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* =========================================
   CSV
========================================= */

async function carregarCSV() {

  try {

    const response = await fetch(CSV_URL);

    const text = await response.text();

    bancoCompleto = parseCSV(text);

    processarDados();

  } catch (err) {

    console.error("Erro ao carregar CSV", err);

  }
}

/* =========================================
   PARSE CSV
========================================= */

function parseCSV(text) {

  const linhas = text
    .split("\n")
    .filter(l => l.trim() !== "");

  const headers = linhas[0]
    .split(";")
    .map(h => h.trim());

  const resultado = [];

  for (let i = 1; i < linhas.length; i++) {

    const linha = linhas[i].split(";");

    const obj = {};

    headers.forEach((header, index) => {

      obj[header] = linha[index]
        ? linha[index].trim()
        : "";

    });

    resultado.push(obj);

  }

  return resultado;
}

/* =========================================
   PONTOS
========================================= */

function pontosPosicao(pos) {

  const tabela = {
    1: 12,
    2: 10,
    3: 8,
    4: 7,
    5: 6,
    6: 5,
    7: 4,
    8: 3,
    9: 2,
    10: 1
  };

  return tabela[pos] || 0;
}

/* =========================================
   PROCESSAR DADOS
========================================= */

function processarDados() {

  const equipes = {};

  bancoCompleto.forEach(row => {

    const nome = row.Time;

    if (!nome) return;

    if (!equipes[nome]) {

      equipes[nome] = {
        nome,

        jogadores: [],

        q1_pos: parseInt(row.Q1_Pos) || 0,
        q2_pos: parseInt(row.Q2_Pos) || 0,
        q3_pos: parseInt(row.Q3_Pos) || 0,

        q1_kills: 0,
        q2_kills: 0,
        q3_kills: 0,

        totalKills: 0,
        totalPP: 0,
        total: 0
      };
    }

    const q1 = parseInt(row.Q1_Kills) || 0;
    const q2 = parseInt(row.Q2_Kills) || 0;
    const q3 = parseInt(row.Q3_Kills) || 0;

    equipes[nome].q1_kills += q1;
    equipes[nome].q2_kills += q2;
    equipes[nome].q3_kills += q3;

    equipes[nome].jogadores.push({
      nick: row.Jogador,
      q1,
      q2,
      q3,
      total: q1 + q2 + q3,
      dano: row.Dano_Medio,
      mvp: row.MVP_Vezes
    });

  });

  rankingAtual = Object.values(equipes);

  rankingAtual.forEach(eq => {

    eq.q1_pp = pontosPosicao(eq.q1_pos);
    eq.q2_pp = pontosPosicao(eq.q2_pos);
    eq.q3_pp = pontosPosicao(eq.q3_pos);

    eq.totalPP =
      eq.q1_pp +
      eq.q2_pp +
      eq.q3_pp;

    eq.totalKills =
      eq.q1_kills +
      eq.q2_kills +
      eq.q3_kills;

    eq.total =
      eq.totalPP +
      eq.totalKills;

  });

  rankingAtual.sort((a, b) => b.total - a.total);

  renderTeams();
  renderRanking();
  renderDetalhes();
  atualizarStats();
}

/* =========================================
   STATS
========================================= */

function atualizarStats() {

  document
    .getElementById("totalTimes")
    .innerText = rankingAtual.length;

  let totalPlayers = 0;

  rankingAtual.forEach(eq => {
    totalPlayers += eq.jogadores.length;
  });

  document
    .getElementById("totalPlayers")
    .innerText = totalPlayers;
}

/* =========================================
   TEAMS
========================================= */

function renderTeams() {

  const grid =
    document.getElementById("teamsGrid");

  grid.innerHTML = "";

  rankingAtual.forEach(eq => {

    grid.innerHTML += `
      <div class="team-card">

        <div class="team-logo">
          ${eq.nome.substring(0,2).toUpperCase()}
        </div>

        <h3 class="team-name">
          ${eq.nome}
        </h3>

        <p class="team-players">
          ${eq.jogadores.length} jogadores
        </p>

      </div>
    `;

  });
}

/* =========================================
   RANKING
========================================= */

function renderRanking(lista = rankingAtual) {

  const body =
    document.getElementById("rankingBody");

  body.innerHTML = "";

  lista.forEach((eq, index) => {

    let rowClass = "";

    if (index === 0) rowClass = "top1";
    if (index === 1) rowClass = "top2";
    if (index === 2) rowClass = "top3";

    let badge = `
      <div class="position-badge">
        ${index + 1}
      </div>
    `;

    if (index === 0) {
      badge = `<div class="position-badge gold">🥇</div>`;
    }

    if (index === 1) {
      badge = `<div class="position-badge silver">🥈</div>`;
    }

    if (index === 2) {
      badge = `<div class="position-badge bronze">🥉</div>`;
    }

    body.innerHTML += `
      <tr class="${rowClass}">

        <td data-label="Posição">
          ${badge}
        </td>

        <td data-label="Equipe">

          <div class="team-inline">

            <div class="team-mini-logo">
              ${eq.nome.substring(0,2)}
            </div>

            <strong>
              ${eq.nome}
            </strong>

          </div>

        </td>

        <td data-label="Q1">
          ${eq.q1_pp + eq.q1_kills}
        </td>

        <td data-label="Q2">
          ${eq.q2_pp + eq.q2_kills}
        </td>

        <td data-label="Q3">
          ${eq.q3_pp + eq.q3_kills}
        </td>

        <td data-label="Kills">
          ${eq.totalKills}
        </td>

        <td data-label="Total">

          <strong style="color:#ff2d55">
            ${eq.total}
          </strong>

        </td>

      </tr>
    `;

  });
}

/* =========================================
   DETALHES
========================================= */

function renderDetalhes() {

  const container =
    document.getElementById("teamsDetails");

  container.innerHTML = "";

  rankingAtual.forEach(eq => {

    let playersHTML = "";

    eq.jogadores.forEach(player => {

      playersHTML += `
        <tr>
          <td>${player.nick}</td>
          <td>${player.total}</td>
          <td>${player.mvp}</td>
        </tr>
      `;

    });

    container.innerHTML += `
      <div class="team-card" style="margin-bottom:24px">

        <div style="
          display:flex;
          align-items:center;
          justify-content:space-between;
          margin-bottom:20px;
          gap:20px;
          flex-wrap:wrap;
        ">

          <div style="
            display:flex;
            align-items:center;
            gap:16px;
          ">

            <div class="team-logo">
              ${eq.nome.substring(0,2)}
            </div>

            <div>

              <h2 class="team-name">
                ${eq.nome}
              </h2>

              <p class="team-players">
                ${eq.jogadores.length} jogadores
              </p>

            </div>

          </div>

          <div style="
            display:flex;
            gap:12px;
            flex-wrap:wrap;
          ">

            <div class="stats-card" style="padding:18px">

              <span>Kills</span>

              <strong style="font-size:24px">
                ${eq.totalKills}
              </strong>

            </div>

            <div class="stats-card" style="padding:18px">

              <span>Pontos</span>

              <strong style="
                font-size:24px;
                color:#ff2d55;
              ">
                ${eq.total}
              </strong>

            </div>

          </div>

        </div>

        <div class="ranking-table-wrapper">

          <table class="ranking-table">

            <thead>

              <tr>
                <th>Jogador</th>
                <th>Kills</th>
                <th>MVP</th>
              </tr>

            </thead>

            <tbody>

              ${playersHTML}

            </tbody>

          </table>

        </div>

      </div>
    `;

  });
}

/* =========================================
   BUSCA
========================================= */

function iniciarBusca() {

  const input =
    document.getElementById("searchRanking");

  input.addEventListener("input", () => {

    const termo =
      input.value.toLowerCase();

    const filtrado =
      rankingAtual.filter(eq =>
        eq.nome.toLowerCase().includes(termo)
      );

    renderRanking(filtrado);

  });
}

/* =========================================
   COPIAR LOBBY
========================================= */

function copiarLobby() {

  let texto = `DEVILS MOBILE LEAGUE 🚩

PLATAFORMA: MOBILE
MODO: SQUAD

🪂 3 QUEDAS
🌴 ILHA DO MEDO

━━━━━━━━━━━━━━`;

  rankingAtual.forEach((eq, index) => {

    texto += `
📍 ${String(index + 1).padStart(2, "0")} — ${eq.nome}`;

  });

  navigator.clipboard.writeText(texto);

  mostrarToast();
}

/* =========================================
   TOAST
========================================= */

function mostrarToast() {

  const toast =
    document.getElementById("toast");

  toast.classList.remove("hidden");

  setTimeout(() => {

    toast.classList.add("hidden");

  }, 2500);
}