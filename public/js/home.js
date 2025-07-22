const socket = io();

document.getElementById('createBtn').addEventListener('click', ()=> {
    console.log('crt btn clckd');
    socket.emit("create-room");
});

document.getElementById('joinBtn').addEventListener('click',()=> {
    const roomId = document.getElementById('roomInput').value;
    console.log('trying to join'+roomId);
    socket.emit("join-room",roomId);
})

socket.on("room-created",(roomId) => {
   window.location.href = `/start?roomId=${roomId}`;
});

socket.on("joined-room",(roomId) => {
   window.location.href = `/start?roomId=${roomId}`;
});

socket.on("Error", (msg) => {
    alert(msg);
});
