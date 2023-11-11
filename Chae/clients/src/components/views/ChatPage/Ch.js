import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import "./css/Ch.css";

const socket = socketIOClient("http://localhost:5000"); // Assuming the server is on port 5000

function App() {
  const [room, setRoom] = useState("");
  const [nickname, setNickname] = useState("익명");
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [createRoomInput, setCreateRoomInput] = useState(""); // Input for creating a room

  useEffect(() => {
    // Define a message event handler
    const handleNewMessage = (data) => {
      console.log(data.text);
      setMessages((prevMessages) => [...prevMessages, data]);
    };

    // Register the message event handler
    socket.on("message", handleNewMessage);

    // Clean up the event handler when the component unmounts
    return () => {
      socket.off("message", handleNewMessage);
    };
  }, []);

  useEffect(() => {
    socket.on("roomList", (data) => {
      console.log(data);
      setRooms(data);
    });

    // 방 목록을 처음 한 번 받아올 때를 고려해 아래와 같이 추가합니다.
    socket.emit("getRoomList");

    // Clean up the event listener when the component unmounts
    return () => {
      socket.off("roomList");
    };
  }, []);

  const sendMessage = () => {
    if (message) {
      socket.emit("message", { text: message, room, nickname });
      setMessage("");
    }
  };

  const joinRoom = (roomName) => {
    socket.emit("joinRoom", roomName);
    setRoom(roomName);
    setMessages([]);
  };

  const createAndJoinRoom = () => {
    if (createRoomInput.trim() !== "") {
      socket.emit("createRoom", createRoomInput);
      joinRoom(createRoomInput);
      setCreateRoomInput("");
    }
  };

  const leaveRoom = () => {
    if (room) {
      socket.emit("leaveRoom", room);
      setRoom("");
      setMessages([]); // Clear the chat messages
    }
  };

  const changeNickname = () => {
    // Implement nickname change logic here
    // For example, you can use a prompt to get a new nickname from the user
    const newNickname = prompt("원하는 닉네임을 적어주세요");
    if (newNickname !== null) {
      setNickname(newNickname);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div style={{ display: "flex", alignItems: "center" }}>
          <p>{room ? `참여 방: ${room}` : "방을 입력해주세요"}</p>
          {room && (
            <button className="leave-room-button" onClick={leaveRoom}>
              나가기
            </button>
          )}
        </div>
        <div className="room-buttons">
          {rooms.map((roomInfo) => (
            <div key={roomInfo.roomName}>
              <button
                className="room-button"
                onClick={() => joinRoom(roomInfo.roomName)}
              >
                {roomInfo.roomName} ({roomInfo.users} users)
              </button>
            </div>
          ))}
        </div>
      </div>

      {!room && (
        <>
          <input
            className="chat-input"
            type="text"
            value={createRoomInput}
            onChange={(e) => setCreateRoomInput(e.target.value)}
            placeholder="방 이름"
          />
          <button className="chat-button" onClick={createAndJoinRoom}>
            방참가
          </button>
        </>
      )}

      <div className="chat-nickname">
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="원하는 닉네임을 적어주세요"
          disabled
        />
      </div>
      <button className="change-nickname-button" onClick={changeNickname}>
        닉네임 변경
      </button>
      <div className="chat-messages">
        <div>
          {messages.map((msg, index) => (
            <div className="chat-message" key={index}>
              {msg.nickname}: {msg.text}
            </div>
          ))}
        </div>
        <div className="chat-input-container">
          <input
            className="chat-input"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지를 입력하세요."
          />
          <button className="chat-button" onClick={sendMessage}>
            보내기
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
