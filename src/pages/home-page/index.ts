import { Router } from "@vaadin/router";
import { state } from "../../state";

export class Home extends HTMLElement {
  connectedCallback() {
    console.log("Home conectado");
    this.render();
  }

  render() {
    this.innerHTML = `
      <h1>Por favor. Ingresá un Nickname</h1>
      <label for="email">email</label>
      <input type="email" id="email" placeholder="Email...">  
      <label for="name">name</label>
      <input type="text" id="name" placeholder="Nombre de usuario..."> 
      <label for="room">room</label>
      <select name="room" id="room">
        <option value="Nuevo room">Nuevo room</option>
        <option value="Room existente">Room existente</option>
      </select> 
      <input type="text" id="roomId" placeholder="RoomId" style="display: none;">
      <button>Enviar</button>
    `;

    const select = this.querySelector('select');
    const input = this.querySelector('#roomId') as HTMLInputElement;

    select?.addEventListener('change', () => {
      if (select.value === 'Room existente') {
        if (input) input.style.display = 'block';
      } else {
        if (input) input.style.display = 'none';
      }
    });

    this.querySelector('button')?.addEventListener('click', async () => {
      const emailInput = this.querySelector('#email') as HTMLInputElement;
      const nombreInput = this.querySelector('#name') as HTMLInputElement;
      const roomIdInput = this.querySelector('#roomId') as HTMLInputElement;

      const email = emailInput?.value;
      const nombre = nombreInput?.value;
      const roomId = roomIdInput?.value;

      if (!email || !nombre) {
        console.error("Por favor ingresa un email y un nombre");
        return;
      }

      if (select && select.value === 'Nuevo room') {
        // Llamar al método signup
        try {
          const userId = await state.Register(email, nombre);
          state.setNombre(nombre);
          state.setUserId(userId); // Guarda el userId en el estado
          console.log("UserId antes de crear room:", userId);
          const newRoomId = await state.creRoom(userId);
          state.setRoomId(newRoomId);
          state.init();
          Router.go('/chatRoom');
        } catch (error) {
          console.error("Error en el signup:", error);
        }
      } else if (select && select.value === 'Room existente') {
        // Llamar al método auth
        if (!roomId) {
          console.error("Por favor ingresa un Room ID");
          return;
        }
        try {
          const userId = await state.authen(email); // Implementa el método auth
          state.setNombre(nombre);
          state.setUserId(userId); // Guarda el userId en el estado
          state.setRoomId(roomId);
          state.init();
          Router.go('/chatRoom');
        } catch (error) {
          console.error("Error en el auth:", error);
        }
      }
    });
  }
}

customElements.define('home-page', Home);
