## 필요 모듈
- express
- http
- socket.io

서버 쪽에서는 
io.on을 통해서 이벤트를 받고 io.emit을 통해서 이벤트를 보낸다.  
-ex)    
io.on('connection', socket => { // 접속을 의미  
    io.emit('announce', 'user connected');  //announce라는 이벤트로 user connected란 메시지를 보낸다.
    }
    
클라이언트는 socket.io을 통해서 이벤트를 바도 socket.emit을 통해서 이벤트를 보낸다.  
-ex ) io.emit('online', connected); // 'online'이라는 이벤트를 받고 메시지를 connected로 받는다.

--room 
