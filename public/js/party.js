const fileInput = document.getElementById('fileInput');
const videoPlayer = videojs('my-player');

const socket = io();
let isSyncing = false; // Flag to prevent feedback loop


socket.on("connect",() => {
    console.log("Connected to server with ID:",socket.id);
    socket.emit('join-room',roomId);
    console.log('joined room'+ roomId);
})



socket.on('sync-seek', (time) => {
            if (videoPlayer.currentSrc()) {
                isSyncing = true;
                videoPlayer.currentTime(time);
                console.log(`Video player synced to: ${time}`);
                setTimeout(() => {
                    isSyncing = false;
                        }, 500);
            } else {
                console.warn('Video source not loaded, cannot sync time.',+ time);
            }
          });

socket.on('sync-play', ()=> {
    if(videoPlayer.currentSrc() && videoPlayer.paused()) {
        isSyncing = true;
        videoPlayer.play();
        console.log('synced to play');
        setTimeout(()=>{
            isSyncing = false;
        },500);
    }
})

socket.on('sync-pause', ()=> {
    if(videoPlayer.currentSrc() && !videoPlayer.paused()) {
        isSyncing = true;
        videoPlayer.pause();
        console.log('synced to pause');
        setTimeout(()=>{
            isSyncing = false;
        },500);
    }
})

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const videoURL = URL.createObjectURL(file);

        videoPlayer.src({
            type: file.type || 'video/mp4',
            src: videoURL
        });

        videoPlayer.ready(() => {

             videoPlayer.off('seeked'); // Remove any previous handler
             videoPlayer.on('seeked', ()=> {
                                if (!isSyncing) {
                                    const time = videoPlayer.currentTime();
                                    console.log('User seeked to:' + time);
                                    socket.emit('sync-seek', time);
                                } else {
                                    console.log('Not re-emitting Seek');
                                }
                        })
            videoPlayer.on('play',()=>{
                if(!isSyncing)
                {
                    console.log('user played video');
                    socket.emit('sync-play');
                } else {
                    console.log("Not re-emitting play");
                }
            })
            videoPlayer.on('pause',()=>{
               if(!isSyncing)
               {
                console.log('user paused video');
                socket.emit('sync-pause');
               } else {
                    console.log("Not re-emitting play");
                }
            })
        });

    }
});

document.getElementById("copyBtn").addEventListener("click", () => {
      const input = document.getElementById("roomCodeInput");
      input.select();
      input.setSelectionRange(0, 99999); 
      navigator.clipboard.writeText(input.value);
    });