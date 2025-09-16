import { state } from "../../state"

type  Messages = {
  fecha: string
  from: string
  message: string
}
export class Chat extends HTMLElement{
  connectedCallback(){
    this.render()
    this.subscribeToState();
    this.addEventListener();
  }

subscribeToState() {
  state.subscribe((newState) => {
    const currentRoomId = state.getState().roomId;
    console.log("subscribeToState - mensajes para roomId", currentRoomId, newState.messages[currentRoomId]);
    this.renderMessages(newState.messages[currentRoomId] || []);
  });
}

  addEventListener(){
    const form =  this.querySelector('form')
    form?.addEventListener('submit', (e) =>{
      e.preventDefault()
      const input = this.querySelector('#chat') as HTMLInputElement
      const message = input.value

      if(message){
        const newMessage: Messages = {
          fecha: new Date().toISOString(),
          from: state.getState().nombre,
          message: message,
        }
        state.sendMessages(newMessage)
        input.value = ''
      }
    })
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



render(){
    const currentState = state.getState()
    this.innerHTML = `
    <h1>Sala de chat</h1>
    <h2>Room ID: ${currentState.roomId}</h2>
    <form>
    <input type="text" id="chat" placeholder="Escribe tu mensaje...">
    <button>Enviar</button>
    </form>
    <div id="messages"></div>
    `;
     this.addEventListener(); // Volver a agregar el listener después de renderizar
  }
}
customElements.define('chat-page', Chat);