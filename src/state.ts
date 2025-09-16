import { rtdb } from "./rtdb"
// Sign Up and Log In importation section
import { signup } from "./api"
import { authentication } from "./api"
import { createRoom } from "./api"
import { getRoom } from "./api"
// Mesages importation section
import { getMessages } from "./api"
import { postMessage } from "./api"
import { putMessage } from "./api"
import { deleteMessage } from "./api"

type  Message = {
  fecha: string
  from: string
  message: string
}

const state = {
  data: {
    nombre: "",
    messages: {},
    id: '',
    email: "",
    roomId: '',
  },
  listeners: [],

  init() {
  const currentRoomId = this.getState().roomId;
  const chatRoomRef = rtdb.ref(`chatrooms/${currentRoomId}/messages`);
  chatRoomRef.on("value", (snapshot) => {
    const messagesFromServer = snapshot.val();
    const newMessages = messagesFromServer ? Object.values(messagesFromServer) : [];
    const currentState = this.getState();
    currentState.messages[currentRoomId] = newMessages;
    this.setState(currentState);
  });
  },
    setNombre(nombre: string){
    const currentState = this.getState();
    currentState.nombre = nombre;
    console.log(currentState.nombre)
    this.setState(currentState)
  },
  setUserId(id: string){
    const currentState = this.getState()
    currentState.id = id,
    console.log(currentState.id);
    this.setState(currentState)
  },
  setRoomId(roomId: string) {
  const currentState = this.getState();
  currentState.roomId = roomId; 
  console.log(currentState.roomId);
  this.setState(currentState);
  },
 // Sign Up and Log In Section ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Register(email:string, nombre:string){
    return signup(email, nombre).then(userCreated =>{
      if(userCreated){
        this.setNombre(nombre)
        this.setUserId(userCreated)
        return userCreated
      }
    })
    .catch(error => {
      console.error("Error al registrar el usuario:", error);
    });
  },
  authen(email:string){
    return authentication(email).then(existingUser =>{
      if(existingUser){
        this.setUserId(existingUser.id)
        return existingUser.id
      }
    })
      .catch(error => {
      console.error("Error al buscar el usuario:", error);
    });
  },
  creRoom(userId: string){
    return createRoom(userId).then(roomCreated =>{
      if(roomCreated){
        return roomCreated
      }
    })
      .catch(error => {
      console.error("Error al crear la sala:", error);
    });
  },
  room(roomId: string, userId: string){
    return getRoom(roomId,userId).then(foundedRoom =>{
      if(foundedRoom){
        return foundedRoom
      }
    })
      .catch(error => {
      console.error("Error al buscar la sala:", error);
    });
  },
  // Messages Section -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  getAllData(){
    return getMessages().then(messages =>{
      const currentState = this.getState()
      currentState.messages = messages
      this.setState(currentState)
    }).catch(error =>{
      console.error("Error al obtener todos los mensajes", error)
    })
  },
  sendMessages(newMessage: Message){
    const currentRoomId = this.getState().roomId;
    const messageToSend = { ...newMessage, roomId: currentRoomId };
    return postMessage(messageToSend).then(sentMessage =>{
    if(sentMessage){
    if (!this.data.messages[currentRoomId]) {
    this.data.messages[currentRoomId] = []; // Inicializa el array si no existe
    }
    this.data.messages[currentRoomId].push(newMessage);
    this.notify()
    console.log(this.data.messages);
    
      }
    }).catch(error =>{
      console.error("Error al enviar el mensaje", error)
    })
  },
  modifiedMessage(id: string, updatedMessage: Partial<Message>){
    return putMessage(id, updatedMessage).then(modMessage =>{
      const currentState = this.getState()
      const upMessage = currentState.messages.map(msg =>{
      return msg.id === id ? modMessage : msg
      })
      this.setState({...currentState, messages: upMessage})
    }).catch(error =>{
      console.error("Error al actualizar el mensaje", error)
    })
  },
  removeMessage(id: string){
    return deleteMessage(id).then(removingMessage =>{
      const currentState = this.getState()
      const deletingMessage = currentState.messages.filter(msg => msg.id !== id)
      this.setState({ ...currentState, messages: deletingMessage });
      console.log("Mensaje removido correctamente")
    }).catch(error => {
      console.error("Error al remover el mensaje:", error);
    });
  },
  getState(){
    return this.data
  },
  setState(newState){
    this.data = newState
    this.listeners.forEach(callback => callback(this.data))
  },
  subscribe(callback){
    this.listeners.push(callback)
  },
  notify() {
    this.listeners.forEach(callback => callback(this.data));
  },
}


export {state}