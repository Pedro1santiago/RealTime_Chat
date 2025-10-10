from flask import Flask, render_template
from flask_sockets import Sockets
from deep_translator import GoogleTranslator
import os
import json

# Caminho absoluto da pasta atual
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, "../../frontend"))

app = Flask(
    __name__,
    static_folder=FRONTEND_DIR,                # arquivos CSS/JS
    template_folder=os.path.join(FRONTEND_DIR, "templates")  # templates
)


sockets = Sockets(app)

# Armazena os websockets ativos e info dos usuários
clients = {}

@app.route('/')
def home():
    print("Rota / requisitada")
    return render_template('index.html')

@sockets.route('/ws')
def websocket_handler(ws):
    user_id = None
    try:
        print("Novo cliente conectado ao WebSocket")
        while not ws.closed:
            message = ws.receive()
            if not message:
                print("Mensagem vazia recebida, ignorando...")
                continue

            print(f"Mensagem recebida do cliente: {message}")

            try:
                data = json.loads(message)
            except Exception as e:
                print("Erro ao converter JSON:", e)
                continue

            # Registro de usuário
            if 'id' in data and 'name' in data:
                user_id = data['id']
                clients[user_id] = {
                    'ws': ws,
                    'name': data['name'],
                    'color': data.get('color', 'black'),
                    'lang': data.get('lang', 'pt')
                }
                print(f"[INFO] Usuário conectado: {clients[user_id]}")
            else:
                # Broadcast com tradução
                sender_id = data.get('userId')
                sender_name = data.get('userName')
                sender_color = data.get('userColor', 'black')
                original_text = data.get('content', '')

                print(f"[CHAT] Mensagem de {sender_name} ({sender_id}): {original_text}")

                for uid, info in clients.items():
                    try:
                        target_lang = info.get('lang', 'pt')
                        print(f"Traduzindo para {target_lang} para o usuário {info.get('name')}")
                        translated_text = GoogleTranslator(source='auto', target=target_lang).translate(original_text)
                        print(f"Texto traduzido: {translated_text}")

                        payload = {
                            'userId': sender_id,
                            'userName': sender_name,
                            'userColor': sender_color,
                            'content': translated_text
                        }

                        info['ws'].send(json.dumps(payload))
                        print(f"Mensagem enviada para {info.get('name')}")
                    except Exception as e:
                        print(f"[ERRO] Erro na tradução ou envio para {info.get('name')}: {e}")

    except Exception as e:
        print(f"[ERRO] Erro geral no WebSocket: {e}")
    finally:
        if user_id and user_id in clients:
            print(f"[INFO] Usuário desconectado: {clients[user_id]['name']}")
            del clients[user_id]

if __name__ == "__main__":
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler

    server = pywsgi.WSGIServer(
        ("0.0.0.0", 5000),
        app,
        handler_class=WebSocketHandler
    )
    print("Servidor rodando em http://0.0.0.0:5000")
    server.serve_forever()
