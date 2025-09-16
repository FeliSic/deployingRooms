import admin from "firebase-admin";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccount = JSON.parse(fs.readFileSync('/etc/secrets/key.json', 'utf-8'));
import express from "express"
import { nanoid } from "nanoid"
import cors from 'cors'
import dotenv from "dotenv"
dotenv.config()

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

app.use(express.static(path.join(__dirname, '../../src/dist')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../src/dist/index.html'));
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
  databaseURL: process.env.DATABASE_URL2
});

const db = admin.firestore()
const rtdb = admin.database()

const userCollection = db.collection("users")
const roomCollection = db.collection("rooms")

// Rooms Section ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// signup
app.post("/signup", (req,res) =>{
  const {email} = req.body
  const {name} = req.body

  userCollection.where("email", "==", email).get().then((searchResponse)=>{
    if(searchResponse.empty){
      userCollection.add({
        email,
        name
      }).then((newUserRef)=>{
        res.status(201).json({userId: newUserRef.id})
      })
    }else{
      res.status(200).json({userId: searchResponse.docs[0].id})
    }
  })
})

// auth
app.post("/auth", (req,res) =>{
  const {email} = req.body

  userCollection.where("email", "==", email).get().then((searchResponse) =>{
    if(searchResponse.empty){
      res.status(404).json({message: "No se encontro el email/usuario"})
    }else{
      res.status(200).json({ userId: searchResponse.docs[0].id})
    }
  })
})

// Create Rooms and RoomId
app.post("/rooms", (req,res) =>{
  const {userId} = req.body
  if (!userId) {
    return res.status(400).json({ error: "userId es requerido" });
  }
  userCollection.doc(userId.toString()).get().then((doc) =>{
    if(doc.exists){
      const roomRef = rtdb.ref("rooms/" + nanoid())
      roomRef.set({
        message: [],
        owner: userId
      }).then(() =>{
        const roomLongId = roomRef.key
        const RoomId = 1000 + Math.floor(Math.random() * 999)
        roomCollection.doc(RoomId.toString()).set({
          rtdbRoomId: roomLongId,
        }).then(() =>{
          res.status(200).json({roomId: RoomId.toString()})
        })
      })
    }else{
      res.status(500).json({error: "No se pudo crear la room"})
    }
  })
})

// Buscando una Room
app.get("/rooms/:roomId", (req,res) =>{
  const {userId} = req.query
  const {roomId} = req.params

  if(!userId){
    return res.status(404).json({error: "userId requerido"})
  }

  userCollection.doc(userId.toString()).get().then((doc) =>{
    if(doc.exists){
      roomCollection.doc(roomId).get().then((snap) =>{
        const data = snap.data()
        res.status(200).json({data:data})
      })
    }else{
      res.status(400).json({error: "No existe un usuario u Sala"})
    }
  })
})

// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Messages Section ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Obtención de los Mensajes
app.get("/messages", (req,res) =>{
  const roomId = req.query.roomId;
  if(!roomId){
    return res.status(400).json({error: "roomId es requerido"});
  }
  const messagesRef = rtdb.ref(`chatrooms/general/messages/${roomId}`);
  messagesRef.once("value").then((snapshot) =>{
    const data = snapshot.val() || {};
    const messages = Object.values(data);
    res.status(200).json({messages});
  }).catch(error =>{
    console.log("Error obteniendo mensajes", error);
    res.status(500).json({error: error});
  });
})

// Envío/creación de un Mensaje
app.post('/messages', (req, res) => {
  const newMessage = req.body;
  const roomId = newMessage.roomId;
  console.log("Mensaje recibido:", newMessage);
  if (!roomId) {
    return res.status(400).json({ error: "roomId es requerido" });
  }
  
  // Guardar el mensaje en la ruta correcta
  const roomRef = rtdb.ref(`chatrooms/general/messages/${roomId}`);
  roomRef.push(newMessage)
    .then(() => {
      res.status(201).json({ message: newMessage });
    }).catch(error => {
      res.status(500).json({ error: "Error al crear el Mensaje", details: error });
    });
});

// Modificacion de un mensaje
app.put("/messages/:id", (req,res) =>{
  const messageRef = rtdb.ref(`chatrooms/general/messages`).child(req.params.id)
  const updateData = req.body
  messageRef.update(updateData).then(() =>{
    res.status(200).json({message: updateData})
  }).catch(error =>{
    console.log("Ocurrio un error al actualizar el mensaje", error)
    res.status(500).json({error})
  })
})

// Eliminacion de un mensaje
app.delete("/messages/:id", (req,res) =>{
  const messageRef = rtdb.ref(`chatrooms/general/messages`).child(req.params.id)
  messageRef.remove().then(() =>{
    res.status(204).end();
  }).catch(error =>{
    console.log("Ocurrio un error al eliminar el mensaje", error)
    res.status(500).json({ message: "Error al eliminar el mensaje", error})
  })
})

app.listen(port, ()=>{
  console.log(`App escuchando en el puerto: ${port}`)
})
