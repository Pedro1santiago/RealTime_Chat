
// ELEMENTOS DOM

const login = document.querySelector(".login");
const loginForm = login.querySelector(".login__form");
const loginInputs = login.querySelectorAll(".login__input");
const backButton = document.querySelector(".back-button");

const chat = document.querySelector(".chat");
const chatForm = chat.querySelector(".chat__form");
const chatInput = document.querySelector(".chat__input");
const chatMessages = chat.querySelector(".chat__messages");

const endButton = document.querySelector(".end-button");
const encerramento = document.querySelector(".encerramento");
const restartButton = document.querySelector(".restart-button");

const graficosSection = document.querySelector(".graficos");
const cards = document.querySelectorAll(".grafico-card");
const display = document.querySelector(".grafico"); // primeiro gráfico como display principal

const seletorIdiomasSection = document.querySelector(".seletor_idiomas");
const seletorIdiomas = document.getElementById("idiomas_select");
const tituloTraducao = document.getElementById("titulo_traducao");

const colors = ["cadetblue", "darkgoldenrod", "cornflowerblue", "darkkhaki", "hotpink", "gold"];
const user = { id: "", name: "", color: "", lang: "" };
let socket;


// TEXTOS

const traducoesTitulo = {
  pt: "Tradução automática em tempo real",
  en: "Real-time automatic translation",
  es: "Traducción automática en tiempo real"
};

const textos = {
  pt: { loginTitulo: "Login", loginBotao: "Entrar", voltar: "Voltar", loginPlaceholder: "Seu nome", chatPlaceholder: "Digite uma mensagem" },
  en: { loginTitulo: "Login", loginBotao: "Enter", voltar: "Back", loginPlaceholder: "Your name", chatPlaceholder: "Type a message" },
  es: { loginTitulo: "Inicio de sesión", loginBotao: "Entrar", voltar: "Volver", loginPlaceholder: "Tu nombre", chatPlaceholder: "Escribe un mensaje" }
};


// FUNÇÕES AUX

const createMessageSelfElement = content => {
  const div = document.createElement("div");
  div.classList.add("message--self");
  div.textContent = content;
  return div;
};

const createMessageOtherElement = (content, sender, senderColor) => {
  const div = document.createElement("div");
  div.classList.add("message--other");
  const span = document.createElement("span");
  span.classList.add("message--sender");
  span.style.color = senderColor;
  span.textContent = sender + ": ";
  div.appendChild(span);
  div.append(content);
  return div;
};

const scrollScreen = () => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });


// CONTROLE DE TELAS

function showScreen(screen) {
  login.style.display = "none";
  chat.style.display = "none";
  seletorIdiomasSection.style.display = "none";
  encerramento.style.display = "none";
  graficosSection.style.display = "none";
  endButton.style.display = "none";

  if (screen === "idioma") seletorIdiomasSection.style.display = "flex";
  if (screen === "login") login.style.display = "flex";
  if (screen === "chat") { chat.style.display = "flex"; endButton.style.display = "block"; }
  if (screen === "encerramento") encerramento.style.display = "flex";
  if (screen === "graficos") graficosSection.style.display = "flex";
}

showScreen("idioma");
history.replaceState({ screen: "idioma" }, "");
window.onpopstate = (event) => { if(event.state) showScreen(event.state.screen); };


// TROCA DE IDIOMA → LOGIN

seletorIdiomas.addEventListener("change", () => {
  const idioma = seletorIdiomas.value;
  tituloTraducao.textContent = traducoesTitulo[idioma] || traducoesTitulo.pt;

  login.querySelector("h2").textContent = textos[idioma].loginTitulo;
  login.querySelector(".login__button").textContent = textos[idioma].loginBotao;
  loginInputs[0].placeholder = textos[idioma].loginPlaceholder;
  backButton.textContent = textos[idioma].voltar;
  chatInput.placeholder = textos[idioma].chatPlaceholder;

  showScreen("login");
  history.pushState({ screen: "login" }, "");
});


// LOGIN

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const nome = loginInputs[0].value.trim();
  const idioma = seletorIdiomas.value;

  if (!nome || !idioma) { alert("Preencha nome e idioma."); return; }

  user.id = crypto.randomUUID();
  user.name = nome;
  user.color = colors[Math.floor(Math.random() * colors.length)];
  user.lang = idioma;

  showScreen("chat");
  history.pushState({ screen: "chat" }, "");

  socket = io();
  socket.on("connect", () => {
    socket.emit("register_user", { id: user.id, name: user.name, color: user.color, lang: user.lang });
  });

  socket.on("chat_message", data => {
    const message = data.userId === user.id
      ? createMessageSelfElement(data.content)
      : createMessageOtherElement(data.content, data.userName, data.userColor);
    chatMessages.appendChild(message);
    scrollScreen();
  });
});


// ENVIO DE MENSAGEM

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if(!chatInput.value.trim()) return;
  const message = { userId: user.id, userName: user.name, userColor: user.color, content: chatInput.value };
  socket.emit("message", message);
  chatInput.value = "";
});


// ENCERRAR CHAT

endButton.addEventListener("click", () => {
  if(socket) { socket.disconnect(); socket = null; }
  restartButton.textContent = "Acessar gráficos da aplicação";
  showScreen("encerramento");
  document.body.style.overflowY = "auto";
  history.pushState({ screen: "encerramento" }, "");
});


// CARDS DE GRÁFICOS

cards.forEach(card => {
  card.addEventListener("click", () => {
    const url = card.dataset.grafico.startsWith("/") 
      ? card.dataset.grafico 
      : "/" + card.dataset.grafico;

    cards.forEach(c => {
      c.classList.remove("active");
      const seta = c.querySelector(".seta");
      if(seta) seta.textContent = "expand_more";
    });

    card.classList.add("active");
    const seta = card.querySelector(".seta");
    if(seta) seta.textContent = "expand_less";

    display.innerHTML = `<img src="${url}?t=${Date.now()}" alt="Gráfico" style="width:100%; max-width:1100px;">`;
    display.scrollIntoView({ behavior: 'smooth' });
  });
});


// BOTÃO RESTART → GRÁFICOS

restartButton.addEventListener("click", () => {
  showScreen("graficos");
  document.body.style.overflowY = "auto";

  // primeiro gráfico
  const primeiro = cards[0];
  const url = primeiro.dataset.grafico.startsWith("/") 
      ? primeiro.dataset.grafico 
      : "/" + primeiro.dataset.grafico;

  cards.forEach(c => c.classList.remove("active"));
  primeiro.classList.add("active");

  display.innerHTML = `<img src="${url}?t=${Date.now()}" alt="Gráfico" style="width:100%; max-width:1100px;">`;
});


// VOLTAR AO INÍCIO

backButton.addEventListener("click", () => {
  showScreen("idioma");
  graficosSection.style.display = "none";
  document.body.style.overflowY = "auto";
  history.pushState({ screen: "idioma" }, "");
});
