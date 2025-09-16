const API_BASE_URL = "https://deployingrooms.onrender.com";


type  Message = {
  fecha: string
  from: string
  message: string
  roomId: string;
}

// Sign Up and log In section -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function signup(email: string, name: string) {
  return fetch(API_BASE_URL + '/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name }),
  }).then(res => res.json())
  .then(data => {
    console.log("Respuesta signup:", data);
    return data.userId;
  });
}

export {signup}

function authentication(email: string) {
  return fetch(API_BASE_URL +'/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  }).then(res =>{
    return res.json()
  })
}

export {authentication}

function createRoom(userId: string) {
  return  fetch(API_BASE_URL +'/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  }).then(res =>{
    return res.json()
  }).then(data =>{
    return data.roomId
  })
}

export {createRoom}


function getRoom(roomId: string, userId: string){
  return fetch(API_BASE_URL+`/rooms/${roomId}?userId=${userId}`).then(res =>{
    return res.json()
  })
}

export {getRoom}

// Messages section ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// verbo Get

function getMessages(roomId: string) {
  return fetch(`${API_BASE_URL}/messages?roomId=${roomId}`, {
    headers: { 'Content-Type': 'application/json' }
  })
  .then(res => res.json())
  .then(data => data.messages)
  .catch(console.error);
}


export {getMessages}

//verbo Post

function postMessage(newMessage: Message) {
  return fetch(`${API_BASE_URL}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newMessage)
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al enviar el mensaje");
    return res.json();
  })
  .then(data => data.message)
  .catch(console.error);
}

export{postMessage}

// Verbo Put

function putMessage(id: string, updatedMessage: Partial<Message>) {
  return fetch(`${API_BASE_URL}/messages/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedMessage)
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al actualizar el mensaje");
    return res.json();
  })
  .then(data => data.message)
  .catch(console.error);
}


export{putMessage}


// Verbo Delete

function deleteMessage(id: string) {
  return fetch(`${API_BASE_URL}/messages/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al eliminar el mensaje");
    return res.json();
  })
  .catch(console.error);
}


export{deleteMessage}