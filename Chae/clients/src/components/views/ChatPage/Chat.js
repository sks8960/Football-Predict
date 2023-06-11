import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const App = () => {
    const [roomName, setRoomName] = useState('');
    const [messages, setMessages] = useState([]);
    const [nickname, setNickname] = useState('');
    const [socket, setSocket] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [showRoomForm, setShowRoomForm] = useState(true);
    const [participants, setParticipants] = useState(0); // 참여자 수 상태 추가

    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    useEffect(() => {
        if (socket && roomName) {
            const handleWelcome = (user, newCount) => {
                addMessage(`${user} arrived!`);
                setParticipants(newCount); // 참여자 수 업데이트
            };

            const handleBye = (left, newCount) => {
                addMessage(`${left} Left!!`);
                setParticipants(newCount); // 참여자 수 업데이트
            };

            const handleNewMessage = (msg) => {
                addMessage(msg);
            };

            const handleRoomChange = (rooms) => {
                setRooms(rooms);
            };

            socket.on('welcome', handleWelcome);
            socket.on('bye', handleBye);
            socket.on('new_message', handleNewMessage);
            socket.on('room_change', handleRoomChange);

            return () => {
                socket.off('welcome', handleWelcome);
                socket.off('bye', handleBye);
                socket.off('new_message', handleNewMessage);
                socket.off('room_change', handleRoomChange);
            };
        }
    }, [socket, roomName]);

    const addMessage = (msg) => {
        setMessages((prevMessages) => [...prevMessages, msg]);
    };

    const handleRoomSubmit = (event) => {
        event.preventDefault();
        if (roomName && socket) {
            socket.emit('enter_room', roomName, showRoom);
            setShowRoomForm(false);
        }
    };

    const showRoom = () => {
        if (!roomName) {
            socket.emit('get_rooms', (rooms) => {
                setRooms(rooms);
            });
        }
    };

    const handleMessageSubmit = (event) => {
        event.preventDefault();
        const input = document.getElementById('msg-input');
        const value = input.value;
        if (socket) {
            socket.emit('new_message', input.value, roomName, () => {
                addMessage(`You: ${value}`);
            });
            input.value = '';
        }
    };

    const handleNicknameSubmit = (event) => {
        event.preventDefault();
        const input = document.getElementById('nickname-input');
        if (socket) {
            socket.emit('nickname', input.value);
            setNickname(input.value);
            socket.emit('enter_room', roomName, showRoom); // 닉네임 설정 후 방에 입장 요청
            setShowRoomForm(false);
            const enterMessage = ` ${roomName}방에 접속하였습니다.`;
            addMessage(enterMessage);
        }
    };


    const handleEnterRoom = (room) => {
        if (socket) {
            if (roomName) {
                leaveRoom(); // Leave the current room before entering a new one
            }
            setRoomName(room);
            setShowRoomForm(false);
            const enterMessage = `Entered ${room} room.`;
            addMessage(enterMessage);
            socket.emit('enter_room', room, showRoom);
        }
    };


    const leaveRoom = () => {
        const currentRoom = roomName;

        setRoomName('');
        setShowRoomForm(true);
        setMessages([]);
        setNickname('');
        setRooms([]);
        setParticipants(0); // 참여자 수 초기화
        if (socket) {
            socket.emit('leave_room', currentRoom, () => {
                const leaveMessage = `방을 나갔습니다.`;
                addMessage(leaveMessage);
            });
        }
    };

    return (
        <div>
            <header>
                <h1>Chat</h1>
            </header>
            <main>
                <div id="welcome">
                    {showRoomForm ? (
                        <div>
                            <h4>Open Rooms:</h4>
                            <ul>
                                {rooms.map((room, index) => (
                                    <li key={index}>
                                        <button onClick={() => handleEnterRoom(room)}>
                                            {room}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <form onSubmit={handleRoomSubmit}>
                                <input
                                    placeholder="room name"
                                    required
                                    type="text"
                                    onChange={(e) => setRoomName(e.target.value)}
                                />
                                <button>Enter Room</button>
                            </form>
                        </div>
                    ) : (
                        <div>
                            <h4>Open Rooms:</h4>
                            <ul>
                                {rooms.map((room, index) => (
                                    <li key={index}>
                                        <button onClick={() => handleEnterRoom(room)}>
                                            {room}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div id="room">
                                <h2>{roomName}</h2>
                                <h3>Participants: {participants}</h3> {/* 수정된 참여자 수 표시 */}
                                <ul>
                                    {messages.map((message, index) => (
                                        <li key={index}>{message}</li>
                                    ))}
                                </ul>
                                <form id="name" onSubmit={handleNicknameSubmit}>
                                    <input
                                        id="nickname-input"
                                        placeholder="nickname"
                                        required
                                        type="text"
                                    />
                                    <button>Save</button>
                                </form>
                                <form id="msg" onSubmit={handleMessageSubmit}>
                                    <input
                                        id="msg-input"
                                        placeholder="message"
                                        required
                                        type="text"
                                    />
                                    <button>Send</button>
                                </form>
                                <button onClick={leaveRoom}>Leave Room</button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;
