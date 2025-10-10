document.addEventListener("DOMContentLoaded", () => {

    console.log("DOM carregado, inicializando script...");

<<<<<<< HEAD
const colors = ["cadetblue", "darkgoldenrod", "cornflowerblue", "darkkhaki", "hotpink", "gold"];
const user = { id: "", name: "", color: "", lang: "" };
let ws = null;
=======
    // Elementos do DOM
    const login = document.querySelector(".login");
    console.log("login:", login);
    const loginForm = login?.querySelector(".login__form");
    console.log("loginForm:", loginForm);
    const loginInput = login?.querySelector(".login__input");
    console.log("loginInput:", loginInput);
    const backButton = document.querySelector(".back-button");
    console.log("backButton:", backButton);
    const formSelector = document.getElementById("seletor_idiomas");
    console.log("formSelector:", formSelector);
>>>>>>> IA_Translater

    const chat = document.querySelector(".chat");
    console.log("chat:", chat);
    const chatForm = chat?.querySelector(".chat__form");
    console.log("chatForm:", chatForm);
    const chatInput = chat?.querySelector(".chat__input");
    console.log("chatInput:", chatInput);
    const chatMessages = chat?.querySelector(".chat__messages");
    console.log("chatMessages:", chatMessages);

    const colors = ["cadetblue", "darkgoldenrod", "cornflowerblue", "darkkhaki", "hotpink", "gold"];
    const user = { id: "", name: "", color: "", lang: "" };
    let websocket = null;

<<<<<<< HEAD
const scrollScreen = () => {
  chatMessages.scrollTop = chatMessages.scrollHeight;
};
=======
    // Funções de mensagem
    const createMessageSelfElement = content => {
        console.log("Criando mensagem própria:", content);
        const div = document.createElement("div");
        div.classList.add("message--self");
        div.textContent = content;
        return div;
    };
>>>>>>> IA_Translater

    const createMessageOtherElement = (content, sender, senderColor) => {
        console.log(`Criando mensagem de outro: ${sender} -> ${content}`);
        const div = document.createElement("div");
        const span = document.createElement("span");
        span.classList.add("message--sender");
        span.style.color = senderColor;
        span.textContent = sender + ": ";
        div.classList.add("message--other");
        div.appendChild(span);
        div.appendChild(document.createTextNode(content));
        return div;
    };

    const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

    const scrollScreen = () => {
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
            console.log("Scroll atualizado");
        }
    };

<<<<<<< HEAD
// LOGIN
const handleLogin = event => {
  event.preventDefault();
  user.id = crypto.randomUUID();
  user.name = loginInput.value.trim();
  user.color = colors[Math.floor(Math.random() * colors.length)];
  user.lang = document.getElementById("idiomas_select").value;
=======
    const processMessage = (message) => {
        console.log("Processando mensagem recebida:", message);
        try {
            const data = JSON.parse(message.data);
>>>>>>> IA_Translater

            // Ignora mensagens que não têm content (ex: registro de usuário)
            if (!data.content) {
                console.log("Mensagem de registro ignorada:", data);
                return;
            }

            const { userId, userName, userColor, content } = data;
            if (!chatMessages) {
                console.error("chatMessages undefined!");
                return;
            }

<<<<<<< HEAD
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
=======
            const msgEl = userId === user.id
                ? createMessageSelfElement(content)
                : createMessageOtherElement(content, userName, userColor);

            chatMessages.appendChild(msgEl);
            scrollScreen();
        } catch (e) {
            console.error("Erro ao processar mensagem:", e);
        }
    };

    // Função para mostrar tela
    function showScreen(screen) {
        console.log("Mostrando tela:", screen);
        if (login) login.style.display = "none";
        if (chat) chat.style.display = "none";
        if (formSelector) formSelector.style.display = "none";

        if (screen === "login" && login) login.style.display = "flex";
        if (screen === "idioma" && formSelector) formSelector.style.display = "flex";
        if (screen === "chat" && chat) chat.style.display = "flex";
    }

    showScreen("idioma");
    history.replaceState({ screen: "idioma" }, "");

    // Login
    const handleLogin = event => {
        event.preventDefault();
        console.log("Tentativa de login...");

        if (!loginInput || !chat) {
            console.error("loginInput ou chat não encontrados!");
            return;
        }

        user.id = crypto.randomUUID();
        user.name = loginInput.value.trim();
        user.color = getRandomColor();
        user.lang = document.getElementById("idiomas_select")?.value || "";
        console.log("Usuário:", user);

        if (!user.name || !user.lang) {
            alert("Por favor, preencha o nome e selecione o idioma.");
            return;
        }

        showScreen("chat");
        history.pushState({ screen: "chat" }, "");

        if (!websocket || websocket.readyState !== WebSocket.OPEN) {
            console.log("Conectando ao WebSocket...");
            websocket = new WebSocket("wss://chat-tech.onrender.com");

            websocket.onopen = () => {
                console.log("WebSocket aberto!");
                websocket.send(JSON.stringify({
                    id: user.id,
                    name: user.name,
                    color: user.color,
                    lang: user.lang
                }));
            };

            websocket.onmessage = processMessage;

            websocket.onclose = () => console.log("WebSocket desconectado");
            websocket.onerror = e => console.error("Erro WebSocket:", e);
        }
    };

    const sendMessage = event => {
        event.preventDefault();
        console.log("Tentando enviar mensagem...");

        if (!chatInput) {
            console.error("chatInput não encontrado!");
            return;
        }
        if (!websocket || websocket.readyState !== WebSocket.OPEN) {
            console.error("WebSocket não aberto!");
            return;
        }

        const content = chatInput.value.trim();
        if (!content) return;

        const message = {
            userId: user.id,
            userName: user.name,
            userColor: user.color,
            content
        };

        console.log("Enviando mensagem:", message);
        websocket.send(JSON.stringify(message));
        chatInput.value = "";
    };

    loginForm?.addEventListener("submit", handleLogin);
    chatForm?.addEventListener("submit", sendMessage);

    backButton?.addEventListener("click", () => {
        console.log("Voltando para tela de idioma");
        showScreen("idioma");
        history.pushState({ screen: "idioma" }, "");
    });

    // Idioma
    const select = document.getElementById("idiomas_select");
    const textos = {
        pt: { loginTitulo: "Login", loginBotao: "Entrar", voltar: "Voltar", loginPlaceholder: "Seu nome", chatPlaceholder: "Digite uma mensagem" },
        en: { loginTitulo: "Login", loginBotao: "Enter", voltar: "Back", loginPlaceholder: "Your name", chatPlaceholder: "Type a message" },
        es: { loginTitulo: "Inicio de sesión", loginBotao: "Entrar", voltar: "Volver", loginPlaceholder: "Tu nombre", chatPlaceholder: "Escribe un mensaje" }
    };

    select?.addEventListener("change", () => {
        console.log("Idioma selecionado:", select.value);
        const placeholderOption = select.querySelector("option[value='']");
        if (placeholderOption) placeholderOption.remove();

        if (select.value && textos[select.value]) {
            const idioma = select.value;
            console.log("Aplicando textos do idioma:", idioma);

            if (login) login.querySelector("h2").textContent = textos[idioma].loginTitulo;
            if (login) login.querySelector(".login__button").textContent = textos[idioma].loginBotao;
            if (login) login.querySelector(".login__input").placeholder = textos[idioma].loginPlaceholder;
            if (backButton) backButton.textContent = textos[idioma].voltar;
            if (chatInput) chatInput.placeholder = textos[idioma].chatPlaceholder;

            showScreen("login");
            history.pushState({ screen: "login" }, "");
        }
    });
>>>>>>> IA_Translater

    window.addEventListener("popstate", event => {
        console.log("Evento popstate:", event.state);
        if (event.state && event.state.screen) showScreen(event.state.screen);
    });

<<<<<<< HEAD
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
=======
>>>>>>> IA_Translater
});

// Histórico navegador (back/forward)
window.addEventListener("popstate", event => {
  if (event.state && event.state.screen) {
    showScreen(event.state.screen);
  }
});
