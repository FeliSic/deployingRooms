import { state } from "../../state";

type Messages = {
  id: string;
  fecha: string;
  from: string;
  message: string;
};

type AppState = {
  roomId: string;
  nombre: string;
  messages: { [key: string]: Messages[] }; // o messages si así lo tenés
};

export class Chat extends HTMLElement {
  connectedCallback() {
    this.render();
    this.subscribeToState();
    this.addEventListenerToForm();
  }

  subscribeToState() {
    state.subscribe((newState: AppState) => {
      const currentRoomId = state.getState().roomId;
      console.log("subscribeToState - mensajes para roomId", currentRoomId, newState.messages[currentRoomId]);
      this.renderMessages(newState.messages[currentRoomId] || []);
    });
  }

  addEventListenerToForm() {
    const form = this.querySelector('form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = this.querySelector('#chat') as HTMLInputElement;
      const message = input.value;

      if (message) {
        const newMessage: Messages = {
          id: crypto.randomUUID(),
          fecha: new Date().toISOString(),
          from: state.getState().nombre,
          message: message,
        };
        state.sendMessages(newMessage);
        input.value = '';
      }
    });
  }

  renderMessages(messages: Messages[]) {
    const filteredMessages = messages.filter(msg => msg && msg.from && msg.message && msg.fecha);

    const messagesList = filteredMessages.map(msg => `
      <div>
        <strong>${msg.from}</strong>: ${msg.message} <em>${msg.fecha}</em>
      </div>
    `).join('');

    this.querySelector('#messages')!.innerHTML = messagesList;
  }

  render() {
    const currentState = state.getState();
    this.innerHTML = `
      <h1>Sala de chat</h1>
      <h2>Room ID: ${currentState.roomId}</h2>
      <form>
        <input type="text" id="chat" placeholder="Escribe tu mensaje...">
        <button>Enviar</button>
      </form>
      <div id="messages"></div>
    `;
    // No llamamos addEventListener aquí para evitar duplicados
  }
}

customElements.define('chat-page', Chat);
