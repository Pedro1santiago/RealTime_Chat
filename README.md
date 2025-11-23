# Chat de Tradução em Tempo Real

Este projeto é um **sistema de tradução automática em tempo real** que permite a comunicação entre usuários que falam idiomas diferentes. Todas as mensagens recebidas são automaticamente traduzidas para o idioma selecionado pelo usuário, garantindo conversas fluídas entre pessoas que não compartilham o mesmo idioma.

## Funcionalidades

* 🌐 Tradução automática de mensagens para o idioma escolhido pelo usuário.
* 🔄 Comunicação em tempo real usando **WebSockets**.
* 🖥️ Interface leve e responsiva que roda diretamente no navegador.
* 🎛️ Seleção dinâmica do idioma de tradução.
* 🔌 Backend local em **Flask**.
* 📡 Envio e recebimento de mensagens em tempo real.

## Tecnologias Utilizadas

### Backend

* **Python 3**
* **Flask**: Framework web para o backend
* **Flask-SocketIO**: Comunicação em tempo real
* **googletrans**: Tradução automática
* **Werkzeug**: Suporte interno do Flask

### Frontend

* **HTML5**: Estrutura da página
* **CSS3**: Estilização e responsividade
* **JavaScript (JS)**: Lógica do chat e tradução
* **Socket.IO Client**: Comunicação em tempo real

## Como o Sistema Funciona

1. O usuário abre o frontend no navegador, que se conecta automaticamente ao servidor via **Socket.IO**.
2. O usuário seleciona seu idioma preferido, que será usado como idioma alvo para todas as traduções.
3. Ao receber uma mensagem:

   * O sistema identifica o idioma original.
   * Traduz automaticamente para o idioma escolhido pelo usuário.
   * Exibe a mensagem original e a traduzida (configuração flexível).
4. Ao enviar uma mensagem:

   * A mensagem é enviada via **WebSocket**.
   * O backend repassa a mensagem para os demais usuários conectados.
   * Cada usuário vê a mensagem traduzida para o seu idioma escolhido.

**Resultado:** Cada pessoa conversa no idioma que quiser, com traduções automáticas em tempo real.

## Estrutura do Projeto

```
/projeto
│
├── app.py                -> Backend Flask + rotas + WebSocket + tradução
├── /frontend
│   ├── index.html        -> Interface principal
│   ├── script.js         -> Conexão WebSocket + lógica de tradução no cliente
│   ├── styles.css        -> Estilos da interface
│   └── assets/           -> Ícones, imagens, etc.
└── /static /uploads      -> Diretórios para arquivos futuros
```

## Estrutura Fictícia do Banco de Dados

Mesmo não integrado, pode ser usado para expansão futura:

### Language

| Campo        | Tipo          | Descrição                    |
| ------------ | ------------- | ---------------------------- |
| LanguageID   | INT (PK)      | Identificador do idioma      |
| LanguageName | NVARCHAR(100) | Nome do idioma (ex: English) |

```sql
CREATE TABLE Language (
    LanguageID INT IDENTITY(1,1) PRIMARY KEY,
    LanguageName NVARCHAR(100) NOT NULL
);
```

### UserLogin

| Campo              | Tipo           | Descrição           |
| ------------------ | -------------- | ------------------- |
| UserID             | INT (PK)       | ID do usuário       |
| UserName           | NVARCHAR(255)  | Nome de login       |
| UserPassword       | VARBINARY(256) | Senha criptografada |
| SelectedLanguageID | INT (FK)       | Idioma escolhido    |
| CreatedAt          | DATETIME       | Data de criação     |

```sql
CREATE TABLE UserLogin (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    UserName NVARCHAR(255) NOT NULL,
    UserPassword VARBINARY(256) NOT NULL,
    SelectedLanguageID INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (SelectedLanguageID) REFERENCES Language(LanguageID)
);
```

### UserAccessLog

| Campo      | Tipo     | Descrição             |
| ---------- | -------- | --------------------- |
| AccessID   | INT (PK) | Registro de acesso    |
| UserID     | INT (FK) | Usuário que acessou   |
| AccessDate | DATETIME | Data e hora do acesso |

```sql
CREATE TABLE UserAccessLog (
    AccessID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    AccessDate DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES UserLogin(UserID)
);
```

### MessageLog

| Campo             | Tipo          | Descrição          |
| ----------------- | ------------- | ------------------ |
| MessageID         | INT (PK)      | ID da mensagem     |
| UserID            | INT (FK)      | Autor da mensagem  |
| OriginalMessage   | NVARCHAR(MAX) | Mensagem original  |
| TranslatedMessage | NVARCHAR(MAX) | Mensagem traduzida |
| SourceLanguageID  | INT (FK)      | Idioma original    |
| TargetLanguageID  | INT (FK)      | Idioma de destino  |
| SentAt            | DATETIME      | Data/hora do envio |

```sql
CREATE TABLE MessageLog (
    MessageID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    OriginalMessage NVARCHAR(MAX) NOT NULL,
    TranslatedMessage NVARCHAR(MAX) NULL,
    SourceLanguageID INT NULL,
    TargetLanguageID INT NULL,
    SentAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES UserLogin(UserID),
    FOREIGN KEY (SourceLanguageID) REFERENCES Language(LanguageID),
    FOREIGN KEY (TargetLanguageID) REFERENCES Language(LanguageID)
);
```

## Como Executar

1. Instale as dependências:

```bash
pip install flask flask-socketio googletrans==4.0.0rc1
```

2. Execute o servidor:

```bash
python app.py
```

3. Abra o navegador e acesse:

```
http://localhost:5000
```
