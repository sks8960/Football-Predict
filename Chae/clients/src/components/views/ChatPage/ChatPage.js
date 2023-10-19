import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

import './css/ChatCss.css'; // Make sure to import your CSS file

function ChatPage() {
    const [roomName, setRoomName] = useState('');
    const [roomList, setRoomList] = useState([]);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const socket = io('http://localhost:5000');
    const messageContainerRef = useRef(null);

    useEffect(() => {
        const getChatRooms = async () => {
            try {
                const response = await axios.get('/api/chat/rooms');
                const roomsData = response.data.roomList;
                setRoomList(roomsData);
            } catch (error) {
                console.error(error);
            }
        };

        getChatRooms();

        socket.on('roomListUpdated', (data) => {
            const updatedRoomList = data.roomList;
            setRoomList(updatedRoomList);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (roomName) {
            socket.emit('join_room', roomName);
        }

        socket.on('message', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);

            // Scroll to the latest message
            if (messageContainerRef.current) {
                messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
            }
        });

        return () => {
            socket.emit('leave_room', roomName);
        };
    }, [roomName, socket]);

    const sendMessage = () => {
        if (message && socket && roomName) {
            socket.emit('send_message', { roomName, message });
            setMessage('');
        }
    };

    return (
        <div className="chat-container">
            <div className="room-list">
                <h3>Room 목록</h3>
                <ul>
                    {roomList.map((room) => (
                        <li key={room.id}>
                            <button onClick={() => setRoomName(room.name)}>
                                {room.name} ({room.usersCount})
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="chat-room">
                <div className="chat-header">
                    <h2>{roomName}</h2>
                </div>
                <div className="messages" ref={messageContainerRef}>
                    <ul>
                        {messages.map((msg, index) => (
                            <li
                                key={index}
                                className={`message ${msg.user === 'You' ? 'my-message' : 'other-message'
                                    }`}
                            >
                                {msg.user}: {msg.text}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="input-container">
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
            </div>
        </div>
    );
}

export default ChatPage;
