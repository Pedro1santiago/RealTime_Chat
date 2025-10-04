const login = document.querySelector(".login");
const loginForm = login.querySelector(".login__form");
const loginInput = login.querySelector(".login__input");
const backButton = document.querySelector(".back-button");
const formSelector = document.getElementById("seletor_idiomas");

const chat = document.querySelector(".chat");
const chatForm = chat.querySelector(".chat__form");
const chatInput = chat.querySelector(".chat__input");
const chatMessages = chat.querySelector(".chat__messages");

const colors = ["cadetblue","darkgoldenrod","cornflowerblue","darkkhaki","hotpink","gold"];
const user = { id: "", name: "", color: "" };
let websocket;

// Funções de mensagem
const createMessageSelfElement = content => {
    const div = document.createElement("div");
    div.classList.add("message--self");
    div.innerHTML = content;
    return div;
}

const createMessageOtherElement = (content, sender, senderColor) => {
    const div = document.createElement("div");
    const span = document.createElement("span");
    div.classList.add("message--other");
    span.classList.add("message--sender");
    span.style.color = senderColor;
    span.innerHTML = sender;
    div.appendChild(span);
    div.innerHTML += content;
    return div;
}

const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];
const scrollScreen = () => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
const processMessage = ({ data }) => {
    const { userId, userName, userColor, content } = JSON.parse(data);
    const message = userId == user.id
        ? createMessageSelfElement(content)
        : createMessageOtherElement(content, userName, userColor);
    chatMessages.appendChild(message);
    scrollScreen();
}

// Função para mostrar a tela correta
function showScreen(screen) {
    login.style.display = "none";
    chat.style.display = "none";
    formSelector.style.display = "none";

    if (screen === "login") login.style.display = "flex";
    if (screen === "idioma") formSelector.style.display = "flex";
    if (screen === "chat") chat.style.display = "flex";
}

// Inicializa tela de idioma
showScreen("idioma");
history.replaceState({screen: "idioma"}, "");

// Login
const handleLogin = event => {
    event.preventDefault();
    user.id = crypto.randomUUID();
    user.name = loginInput.value;
    user.color = getRandomColor();

    showScreen("chat");
    history.pushState({screen: "chat"}, "");

    websocket = new WebSocket("wss://chat-tech.onrender.com");
    websocket.onmessage = processMessage;
}

// Enviar mensagem
const sendMessage = event => {
    event.preventDefault();
    const message = { userId: user.id, userName: user.name, userColor: user.color, content: chatInput.value };
    websocket.send(JSON.stringify(message));
    chatInput.value = "";
}

loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);

// Voltar via botão
backButton.addEventListener("click", () => {
    showScreen("idioma");
    history.pushState({screen: "idioma"}, "");
});

// Idioma selecionado
const select = document.getElementById("idiomas_select");
const textos = {
    pt: { loginTitulo: "Login", loginBotao: "Entrar", voltar: "Voltar", loginPlaceholder: "Seu nome", chatPlaceholder: "Digite uma mensagem" },
    en: { loginTitulo: "Login", loginBotao: "Enter", voltar: "Back", loginPlaceholder: "Your name", chatPlaceholder: "Type a message" },
    es: { loginTitulo: "Inicio de sesión", loginBotao: "Entrar", voltar: "Volver", loginPlaceholder: "Tu nombre", chatPlaceholder: "Escribe un mensaje" }
}

select.addEventListener("change", () => {
    const placeholderOption = select.querySelector("option[value='']");
    if (placeholderOption) placeholderOption.remove();

    if (select.value) {
        const idioma = select.value;
        if (textos[idioma]) {
            login.querySelector("h2").textContent = textos[idioma].loginTitulo;
            login.querySelector(".login__button").textContent = textos[idioma].loginBotao;
            login.querySelector(".login__input").placeholder = textos[idioma].loginPlaceholder;
            backButton.textContent = textos[idioma].voltar;
            chatInput.placeholder = textos[idioma].chatPlaceholder;
        }
        showScreen("login");
        history.pushState({screen: "login"}, "");
    }
});

// Voltar/Avançar navegador
window.addEventListener("popstate", event => {
    if (event.state && event.state.screen) showScreen(event.state.screen);
});
