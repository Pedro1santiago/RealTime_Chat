const login = document.querySelector(".login");
const loginForm = login.querySelector(".login__form");
const loginInput = login.querySelector(".login__input");
const backButton = document.querySelector(".back-button");
const formSelector = document.getElementById("seletor_idiomas");

const chat = document.querySelector(".chat");
const chatForm = chat.querySelector(".chat__form");
const chatInput = chat.querySelector(".chat__input");
const chatMessages = chat.querySelector(".chat__messages");

const colors = ["cadetblue", "darkgoldenrod", "cornflowerblue", "darkkhaki", "hotpink", "gold"];
const user = { id: "", name: "", color: "", lang: "" };
let ws = null;

// Cria mensagens
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

const scrollScreen = () => {
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

// Alterna telas
function showScreen(screen) {
  login.style.display = "none";
  chat.style.display = "none";
  formSelector.style.display = "none";

  if (screen === "login") login.style.display = "flex";
  if (screen === "idioma") formSelector.style.display = "flex";
  if (screen === "chat") chat.style.display = "flex";
}

// Inicia na tela de idioma
showScreen("idioma");
history.replaceState({ screen: "idioma" }, "");

// LOGIN
const handleLogin = event => {
  event.preventDefault();
  user.id = crypto.randomUUID();
  user.name = loginInput.value.trim();
  user.color = colors[Math.floor(Math.random() * colors.length)];
  user.lang = document.getElementById("idiomas_select").value;

  if (!user.name || !user.lang) {
    alert("Por favor, preencha o nome e selecione o idioma.");
    return;
  }

  showScreen("chat");
  history.pushState({ screen: "chat" }, "");

  // Cria conexão WebSocket — adapte a URL se necessário
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    ws = new WebSocket("wss://chat-tech.onrender.com");

    ws.addEventListener("open", () => {
      // Envia registro de usuário
      const msg = {
        type: "register_user",
        id: user.id,
        name: user.name,
        color: user.color,
        lang: user.lang
      };
      ws.send(JSON.stringify(msg));
    });

    ws.addEventListener("message", event => {
      try {
        const data = JSON.parse(event.data);
        // Supondo que o backend envia objeto com as mesmas chaves
        const { userId, userName, userColor, content } = data;
        const messageEl = (userId === user.id)
          ? createMessageSelfElement(content)
          : createMessageOtherElement(content, userName, userColor);

        chatMessages.appendChild(messageEl);
        scrollScreen();
      } catch (e) {
        console.error("Erro ao processar mensagem recebida:", e);
      }
    });

    ws.addEventListener("error", err => {
      console.error("Erro no WebSocket:", err);
    });

    ws.addEventListener("close", () => {
      console.warn("Conexão WebSocket fechada");
    });
  }
};

// Envia mensagem
const sendMessage = event => {
  event.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  const msg = {
    type: "message",
    userId: user.id,
    userName: user.name,
    userColor: user.color,
    content: text
  };

  ws.send(JSON.stringify(msg));
  chatInput.value = "";
};

// Eventos
loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);

// Botão voltar
backButton.addEventListener("click", () => {
  showScreen("idioma");
  history.pushState({ screen: "idioma" }, "");
});

// Troca idioma de interface
const select = document.getElementById("idiomas_select");
const textos = {
  pt: { loginTitulo: "Login", loginBotao: "Entrar", voltar: "Voltar", loginPlaceholder: "Seu nome", chatPlaceholder: "Digite uma mensagem" },
  en: { loginTitulo: "Login", loginBotao: "Enter", voltar: "Back", loginPlaceholder: "Your name", chatPlaceholder: "Type a message" },
  es: { loginTitulo: "Inicio de sesión", loginBotao: "Entrar", voltar: "Volver", loginPlaceholder: "Tu nombre", chatPlaceholder: "Escribe un mensaje" }
};

select.addEventListener("change", () => {
  const idioma = select.value;
  if (textos[idioma]) {
    login.querySelector("h2").textContent = textos[idioma].loginTitulo;
    login.querySelector(".login__button").textContent = textos[idioma].loginBotao;
    login.querySelector(".login__input").placeholder = textos[idioma].loginPlaceholder;
    backButton.textContent = textos[idioma].voltar;
    chatInput.placeholder = textos[idioma].chatPlaceholder;
  }
  showScreen("login");
  history.pushState({ screen: "login" }, "");
});

// Histórico navegador (back/forward)
window.addEventListener("popstate", event => {
  if (event.state && event.state.screen) {
    showScreen(event.state.screen);
  }
});
