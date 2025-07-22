const express = require('express');
const app = express();
const path = require('path');
const { Server } = require('socket.io');
const rooms = {};

app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/videojs', express.static(path.join(__dirname, 'node_modules/video.js/dist')));

app.get('/',(req,res)=>{
    res.render('home')
})

app.get('/start',(req,res)=>{
    const roomId = req.query.roomId;
    if (rooms[roomId]) {
    res.render('party', {roomId});
    } else {
        res.send("Room Not Found");
    }
})

const  expressServer = app.listen(3000, () => {
    console.log("Serving on port 3000")
});

const io = new Server(expressServer,{
    
});

io.on('connection',socket=>{
     console.log(`${socket.id} have joined the server`);

     socket.on('create-room',()=>{
        console.log('are node js bai create a aroom');
        const roomId = genRoomId();
        rooms[roomId] = { host: socket.id }
        socket.join(roomId)
        socket.emit("room-created",roomId)
     });

     socket.on('join-room', (roomId)=>{
        if(rooms[roomId]) 
                {
                    console.log(roomId);
                    socket.join(roomId);
                    socket.roomId = roomId; //storing room id in socket object
                    socket.emit("joined-room", roomId);
                    socket.to(roomId).emit("user-joined",socket.id);
        } else {
                    socket.emit("Error","Room not found");
        }
     });

    socket.on('sync-seek', (time) => {
    const roomId = socket.roomId;
    if (roomId) {
        console.log('Syncing to:', time);
        socket.to(roomId).emit('sync-seek', time);
    }
});

    socket.on('sync-play', ()=>{
        const  roomId = socket.roomId;
        if(roomId) {
            console.log('Recieved req to play');
            socket.to(roomId).emit('sync-play');
        }
       
    });

    socket.on('sync-pause',()=>{
        const  roomId = socket.roomId;
        if(roomId) {
                console.log('Recieved req to pause');
                socket.to(roomId).emit('sync-pause');
        }
        
    })
    
})      

function genRoomId(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

