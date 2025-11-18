from flask import Flask, send_from_directory, request, Response
from flask_socketio import SocketIO
from googletrans import Translator
import os
import io
import numpy as np
import matplotlib.pyplot as plt
import random
import time
from functools import wraps  # necessário para evitar conflito de endpoint


# CAMINHOS DO PROJETO

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, "../../frontend"))


# CONFIGURAÇÃO FLASK + SOCKETIO

app = Flask(__name__,
            static_folder=os.path.join(FRONTEND_DIR),
            static_url_path="/")
socketio = SocketIO(app, cors_allowed_origins="*")
translator = Translator()


# DADOS DO CHAT

users = {}
tempos_traducao = []  # guarda tempos de resposta simulados


# ROTAS BÁSICAS

@app.route('/')
def home():
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(FRONTEND_DIR, filename)


# EVENTOS DO CHAT

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
            inicio = time.time()
            translated_text = translator.translate(original_text, dest=target_lang).text
            fim = time.time()

            
            tempos_traducao.append(fim - inicio)
            if len(tempos_traducao) > 100:
                tempos_traducao.pop(0)

            socketio.emit('chat_message', {
                'userId': sender_id,
                'userName': sender_name,
                'userColor': sender_color,
                'content': translated_text
            }, room=info['sid'])
        except Exception as e:
            print("Erro na tradução:", e)


# DECORADOR PARA GERAR GRÁFICOS

def gerar_grafico(func):
    """Decorador para gerar PNG a partir do matplotlib"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        fig = func(*args, **kwargs)
        buf = io.BytesIO()
        fig.savefig(buf, format='png')
        buf.seek(0)
        plt.close(fig)
        return Response(buf.getvalue(), mimetype='image/png')
    return wrapper


# ROTAS DE GRÁFICOS

@app.route('/grafico')
@gerar_grafico
def grafico_latencia():
    x = np.linspace(0, 10, 100)
    y = np.sin(x) + np.random.rand(100) * 0.2
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.plot(x, y, label='Latência média', color='blue')
    ax.set_title('Latência média da tradução em tempo real')
    ax.set_xlabel('Tempo')
    ax.set_ylabel('Latência')
    ax.legend()
    return fig

@app.route('/grafico1')
@gerar_grafico
def grafico_cpu():
    x = np.linspace(0, 10, 100)
    y = np.cos(x) + np.random.rand(100) * 0.3
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.plot(x, y, color='orange', label='Uso de CPU')
    ax.set_title('Gráfico de Uso de CPU (%)')
    ax.set_xlabel('Tempo')
    ax.set_ylabel('CPU (%)')
    ax.legend()
    return fig

@app.route('/grafico2')
@gerar_grafico
def grafico_conexoes():
    x = np.linspace(0, 10, 100)
    y = np.exp(-x/3) + np.random.rand(100) * 0.1
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.plot(x, y, color='green', label='Conexões ativas')
    ax.set_title('Gráfico de Conexões Ativas')
    ax.set_xlabel('Tempo')
    ax.set_ylabel('Conexões')
    ax.legend()
    return fig

@app.route('/grafico3')
@gerar_grafico
def grafico_distribuicao():
    categorias = ['PT', 'EN', 'ES', 'FR']
    valores = [random.randint(10, 100) for _ in categorias]
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.bar(categorias, valores, color=['#4CAF50', '#2196F3', '#FFC107', '#9C27B0'])
    ax.set_title('Distribuição de Idiomas no Chat')
    ax.set_ylabel('Quantidade de Mensagens')
    return fig

@app.route('/grafico4')
@gerar_grafico
def grafico_comparativo():
    x = np.linspace(0, 10, 50)
    y1 = np.sin(x)
    y2 = np.sin(x + 1)
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.plot(x, y1, label='Tradução EN', color='blue')
    ax.plot(x, y2, label='Tradução ES', color='red')
    ax.set_title('Comparativo de Tempo de Tradução')
    ax.set_xlabel('Tempo (s)')
    ax.set_ylabel('Latência')
    ax.legend()
    return fig

@app.route('/grafico5')
@gerar_grafico
def grafico_tempo_resposta():
    if len(tempos_traducao) < 2:
        valores = [random.uniform(0.5, 2.5) for _ in range(20)]
    else:
        valores = tempos_traducao[-20:]
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.plot(valores, marker='o', color='purple', label='Tempo de resposta (s)')
    ax.set_title('Tempo médio de resposta das traduções')
    ax.set_xlabel('Últimas Mensagens')
    ax.set_ylabel('Segundos')
    ax.legend()
    return fig


# EXECUÇÃO

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)    
