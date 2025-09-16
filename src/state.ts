import { rtdb } from "./rtdb";
// Sign Up and Log In importation section
import { signup } from "./api";
import { authentication } from "./api";
import { createRoom } from "./api";
import { getRoom } from "./api";
// Messages importation section
import { getMessages } from "./api";
import { postMessage } from "./api";
import { putMessage } from "./api";
import { deleteMessage } from "./api";

type Message = {
  id: string;
  fecha: string;
  from: string;
  message: string;
};

type AppState = {
  nombre: string;
  messages: { [roomId: string]: Message[] };
  id: string;
  email: string;
  roomId: string;
};

const state = {
  data: {
    nombre: "",
    messages: {} as { [roomId: string]: Message[] },
    id: '',
    email: "",
    roomId: '',
  },
  listeners: [] as Array<(state: AppState) => void>,

  init() {
    const currentRoomId = this.getState().roomId;
    if (!currentRoomId) return; // Si no hay roomId, no hace nada
    const chatRoomRef = rtdb.ref(`chatrooms/general/messages/${currentRoomId}`);
    chatRoomRef.on("value", (snapshot) => {
      const messagesFromServer = snapshot.val();
      const newMessages = messagesFromServer ? Object.values(messagesFromServer) as Message[] : [];
      const currentState = this.getState();
      currentState.messages[currentRoomId] = newMessages;
      this.setState(currentState);
    });
  },

  setNombre(nombre: string) {
    const currentState = this.getState();
    currentState.nombre = nombre;
    console.log(currentState.nombre);
    this.setState(currentState);
  },

  setUserId(id: string) {
    const currentState = this.getState();
    currentState.id = id;
    console.log(currentState.id);
    this.setState(currentState);
  },

  setRoomId(roomId: string) {
    const currentState = this.getState();
    currentState.roomId = roomId;
    console.log(currentState.roomId);
    this.setState(currentState);
    this.init(); // Reiniciar la escucha al cambiar de sala
  },

  // Sign Up and Log In Section
  Register(email: string, nombre: string) {
    return signup(email, nombre).then(userCreated => {
      if (userCreated) {
        this.setNombre(nombre);
        this.setUserId(userCreated);
        return userCreated;
      }
    })
    .catch(error => {
      console.error("Error al registrar el usuario:", error);
    });
  },

  authen(email: string) {
    return authentication(email).then(existingUser => {
      if (existingUser) {
        this.setUserId(existingUser.id);
        return existingUser.id;
      }
    })
    .catch(error => {
      console.error("Error al buscar el usuario:", error);
    });
  },

  creRoom(userId: string) {
    return createRoom(userId).then(roomCreated => {
      if (roomCreated) {
        return roomCreated;
      }
    })
    .catch(error => {
      console.error("Error al crear la sala:", error);
    });
  },

  room(roomId: string, userId: string) {
    return getRoom(roomId, userId).then(foundedRoom => {
      if (foundedRoom) {
        return foundedRoom;
      }
    })
    .catch(error => {
      console.error("Error al buscar la sala:", error);
    });
  },

  // Messages Section
  getAllData(roomId: string) {
    return getMessages(roomId).then(messages => {
      const currentState = this.getState();
      currentState.messages[roomId] = messages; // Almacena los mensajes en la sala correspondiente
      this.setState(currentState);
    }).catch(error => {
      console.error("Error al obtener todos los mensajes", error);
    });
  },

  sendMessages(newMessage: Message) {
    const currentRoomId = this.getState().roomId;
    const messageToSend = { ...newMessage, roomId: currentRoomId };
    return postMessage(messageToSend).then(sentMessage => {
      if (sentMessage) {
        if (!this.data.messages[currentRoomId]) {
          this.data.messages[currentRoomId] = []; // Inicializa el array si no existe
        }
        this.data.messages[currentRoomId].push(sentMessage); // Usar sentMessage para incluir el id
        this.notify();
        console.log(this.data.messages);
      }
    }).catch(error => {
      console.error("Error al enviar el mensaje", error);
    });
  },

  modifiedMessage(id: string, updatedMessage: Partial<Message>) {
    return putMessage(id, updatedMessage).then(modMessage => {
      const currentState = this.getState();
      const currentRoomId = currentState.roomId; // Obtener el roomId actual
      const messagesForRoom = currentState.messages[currentRoomId] || []; // Acceder al array de mensajes de la sala actual

      // Actualizar el mensaje en el array correspondiente
      const upMessage = messagesForRoom.map(msg => {
        return msg.id === id ? { ...msg, ...modMessage } : msg; // Combinar el mensaje existente con el modificado
      });

      // Asignar el array actualizado de vuelta al estado
      currentState.messages[currentRoomId] = upMessage;
      this.setState(currentState);
    }).catch(error => {
      console.error("Error al actualizar el mensaje", error);
    });
  },

  removeMessage(id: string) {
    return deleteMessage(id).then(removingMessage => {
      const currentState = this.getState();
      const currentRoomId = currentState.roomId; // Obtener el roomId actual
      const messagesForRoom = currentState.messages[currentRoomId] || []; // Acceder al array de mensajes de la sala actual

      // Filtrar el mensaje que se quiere eliminar
      const deletingMessage = messagesForRoom.filter(msg => msg.id !== id);

      // Asignar el array actualizado de vuelta al estado
      currentState.messages[currentRoomId] = deletingMessage;
      this.setState(currentState);

      console.log("Mensaje removido correctamente");
    }).catch(error => {
      console.error("Error al remover el mensaje:", error);
    });
  },

  getState() {
    return this.data;
  },

  setState(newState: AppState) {
    this.data = newState;
    this.listeners.forEach(callback => callback(this.data));
  },

  subscribe(callback: (state: AppState) => void) {
    this.listeners.push(callback);
  },

  notify() {
    this.listeners.forEach(callback => callback(this.data));
  },
};

export { state };
