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

### express를 사용한 기본 socket(server)
const express = require("express");  
const { createServer } = require("http");  
const { Server } = require("socket.io");  

const app = express();  
const httpServer = createServer(app);  
const io = new Server(httpServer, { /* options */ });  

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);

서버에 연결된 클라이언트 수 구하기 : 
const count = io.of('/').sockets.size; // '/'경로의 클라이언트 수 구

사용자 지전 세션 생성 : 
const uuid = require("uuid");

io.engine.generateId = (req) => {
  return uuid.v4(); // must be unique across all Socket.IO servers
}

engine.io 서버에서 세가지 이벤트 보내기
- initial_header : 세션의 첫 번째 HTTP요(핸드셰이크)의 응답 헤더를 작성하기 직전에 내보내지므로 사용자 지정할 수 있다.  
ex) io.engine.on("initial_headers", (headers, req) => {  
  headers["test"] = "123";  
  headers["set-cookie"] = "mycookie=456";
});

- headers : 세션의 각 HTTP요청의 응답헤더를 작성하기 전에 내보내 지므로 사용자 정의 할 수 있다.  
ex) io.engine.on("headers", (headers, req) => {  
  headers["test"] = "789";
});

- connection_error : 연결이 비정상적으로 닫힐 때 내보내짐  
ex) io.engine.on("connection_error", (err) => {  
  console.log(err.req);      // the request object  
  console.log(err.code);     // the error code, for example 1  
  console.log(err.message);  // the error message, for example "Session ID unknown"  
  console.log(err.context);  // some additional error context
});

## 유틸리티 메소드
- socketsJoin : 일치하는 소켓 인스턴스가 지정된 룸에 조인
- socketsLeave : 일치하는 소켓 인스턴스가 지정된 방을 떠남
- disconnectSockets : 일치하는 소켓 인스턴스의 연결을 끊음
- fetchSockets : 일치하는 소켓 인스턴스 반환

socketsJoin
- io.socketsJoin('room1') : 모든 소켓을 room1방에 참여하도록 함
- io.in('room1').socketsJoin(['room2', 'room3']) : room1의 모든 소켓 인스턴스들을 room2와 room3에 참여시킴
- io.of("/admin").in("room1").socketsJoin("room2") : 네임스페이스'admin' 안의 room1의 모든 소켓 인스턴스들을 room2로 참여시
- io.in(theSocketId).socketsJoin("room1") : theSocketId를 가진 소켓을 room1에 참여시킴

socketsLeave(방식은 위와 같음)
- io.socketsLeave("room1");
- io.in("room1").socketsLeave(["room2", "room3"]);
- io.of("/admin").in("room1").socketsLeave("room2");
- io.in(theSocketId).socketsLeave("room1");

disconnectSockets
- io.disconnectSockets() : 모든 소켓들의 연결을 끊음
- io.in('room1').disconnectSockets(true) : room1안의 소켓들의 연결을 끊음
- io.of('/admin').in('room1').disconnectSockets() : admin의 room1안의 소켓들의 연결을 끊음
- io.of('/admin').in(theSocketId).disconnectSockets() : admin의 지정된 소켓의 연결을 끊음

fetchSockets : 소켓 반환
- const sockets = await io.fetchSockets();
- const sockets = await io.in("room1").fetchSockets();
- const sockets = await io.of("/admin").in("room1").fetchSockets();
- const sockets = await io.in(theSocketId).fetchSockets();

socket.handshake - 서버측 코드
- headers, query, auth, time, issued, url, address, sdomain. sercure 포함

socket.rooms : socket이 현재 있는 방에 대한 참조  
console.log(socket.rooms); //   { <socket.id> }  
socket.join("room1");  
console.log(socket.rooms); //   { <socket.id>, "room1" }

socket.on(eventName, listener) : eventName이 올때 listener을 받음
socket.once(eventName, listener) : event를 한번만 실행
socket.off(eventName, listener) : event에서 listener를 제거
socket.removeAllListener([eventName]) : event에서 모든 listener를 제거

