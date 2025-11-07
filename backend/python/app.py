from flask import Flask, send_from_directory, request
from flask_socketio import SocketIO
from googletrans import Translator
import os

# Caminho absoluto da pasta atual (onde este app.py está)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Caminho para a pasta frontend (2 níveis acima)
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, "../../frontend"))

# Cria o app Flask apontando para os arquivos estáticos
app = Flask(__name__,
            static_folder=os.path.join(FRONTEND_DIR),
            static_url_path="/")

socketio = SocketIO(app, cors_allowed_origins="*")
translator = Translator()

users = {}

@app.route('/')
def home():
    # Serve o index.html diretamente da pasta frontend
    return send_from_directory(FRONTEND_DIR, 'index.html')


@app.route('/<path:filename>')
def serve_static(filename):
    # Permite servir arquivos como CSS, JS e imagens da pasta frontend
    return send_from_directory(FRONTEND_DIR, filename)


@socketio.on('connect')
def handle_connect():
    print("Novo cliente conectado!")


@socketio.on('disconnect')
def handle_disconnect():
    disconnected = [uid for uid, info in users.items() if info['sid'] == request.sid]
    for uid in disconnected:
        print(f"Usuário desconectado: {users[uid]['name']}")
        del users[uid]


@socketio.on('register_user')
def register_user(data):
    user_id = data['id']
    users[user_id] = {
        'name': data['name'],
        'color': data['color'],
        'lang': data['lang'],
        'sid': request.sid
    }
    print(f"Usuário registrado: {users[user_id]}")


@socketio.on('message')
def handle_message(data):
    sender_id = data['userId']
    sender_name = data['userName']
    sender_color = data['userColor']
    original_text = data['content']

    print(f"Mensagem recebida de {sender_name}: {original_text}")

    for uid, info in users.items():
        try:
            target_lang = info['lang']
            translated_text = translator.translate(original_text, dest=target_lang).text

            socketio.emit('chat_message', {
                'userId': sender_id,
                'userName': sender_name,
                'userColor': sender_color,
                'content': translated_text
            }, room=info['sid'])
        except Exception as e:
            print("Erro na tradução:", e)

@app.route('/grafico')
def gerar_grafico():
    import io
    import base64
    import numpy as np
    import matplotlib.pyplot as plt

    # --- Gráfico fictício ---
    x = np.linspace(0, 10, 100)
    y = np.sin(x) + np.random.rand(100) * 0.2

    plt.figure(figsize=(8, 5))
    plt.plot(x, y, label='Exemplo de gráfico', color='blue')
    plt.title('Gráfico de Latência média da tradução em tempo real')
    plt.xlabel('Tempo')
    plt.ylabel('Valor')
    plt.legend()
    plt.tight_layout()

    # Converter para base64
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()

    return f"data:image/png;base64,{img_base64}"

@app.route('/grafico1')
def grafico1():
    import io, base64, numpy as np, matplotlib.pyplot as plt
    x = np.linspace(0, 10, 100)
    y = np.cos(x) + np.random.rand(100) * 0.3

    plt.figure(figsize=(8, 5))
    plt.plot(x, y, color='orange', label='Uso de CPU')
    plt.title('Gráfico de Uso de CPU (%)')
    plt.xlabel('Tempo')
    plt.ylabel('CPU (%)')
    plt.legend()
    plt.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    img = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()
    return f"data:image/png;base64,{img}"


@app.route('/grafico2')
def grafico2():
    import io, base64, numpy as np, matplotlib.pyplot as plt
    x = np.linspace(0, 10, 100)
    y = np.exp(-x/3) + np.random.rand(100) * 0.1

    plt.figure(figsize=(8, 5))
    plt.plot(x, y, color='green', label='Conexões ativas')
    plt.title('Gráfico de Conexões Ativas')
    plt.xlabel('Tempo')
    plt.ylabel('Conexões')
    plt.legend()
    plt.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    img = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()
    return f"data:image/png;base64,{img}"


@app.route('/grafico3')
def grafico3():
    import io, base64, numpy as np, matplotlib.pyplot as plt
    categorias = ['PT', 'EN', 'ES', 'FR']
    valores = [np.random.randint(10, 100) for _ in categorias]

    plt.figure(figsize=(8, 5))
    plt.bar(categorias, valores, color=['#4CAF50', '#2196F3', '#FFC107', '#9C27B0'])
    plt.title('Distribuição de Idiomas no Chat')
    plt.ylabel('Quantidade de Mensagens')
    plt.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    img = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()
    return f"data:image/png;base64,{img}"


@app.route('/grafico4')
def grafico4():
    import io, base64, numpy as np, matplotlib.pyplot as plt
    x = np.linspace(0, 10, 50)
    y1 = np.sin(x)
    y2 = np.sin(x + 1)

    plt.figure(figsize=(8, 5))
    plt.plot(x, y1, label='Tradução EN', color='blue')
    plt.plot(x, y2, label='Tradução ES', color='red')
    plt.title('Comparativo de Tempo de Tradução')
    plt.xlabel('Tempo (s)')
    plt.ylabel('Latência')
    plt.legend()
    plt.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    img = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()
    return f"data:image/png;base64,{img}"




if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
