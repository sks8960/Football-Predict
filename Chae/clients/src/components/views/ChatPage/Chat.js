import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const App = () => {
    const [roomName, setRoomName] = useState('');
    const [messages, setMessages] = useState([]);
    const [nickname, setNickname] = useState('');
    const [socket, setSocket] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [showRoomForm, setShowRoomForm] = useState(true);
    const [participants, setParticipants] = useState(0);

    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('welcome', (user, newCount) => {
            addMessage(`${user} arrived!`);
            setParticipants(newCount);
        });

        newSocket.on('bye', (left, newCount) => {
            addMessage(`${left} Left!!`);
            setParticipants(newCount);
        });

        newSocket.on('new_message', (msg) => {
            addMessage(msg);
        });

        return () => {
            newSocket.close();
        };
    }, []);

    const addMessage = (msg) => {
        setMessages((prevMessages) => [...prevMessages, msg]);
    };

    const enterRoom = (room) => {
        if (socket) {
            if (roomName) {
                leaveRoom();
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
        setParticipants(0);
        if (socket) {
            socket.emit('leave_room', currentRoom, () => {
                const leaveMessage = `Left the room.`;
                addMessage(leaveMessage);
            });
        }
    };

    const showRoom = () => {
        if (!roomName && socket) {
            socket.emit('get_rooms', (availableRooms) => {
                setRooms(availableRooms);
            });
        }
    };

    const handleRoomSubmit = (event) => {
        event.preventDefault();
        if (roomName && socket) {
            socket.emit('enter_room', roomName, showRoom);
            setShowRoomForm(false);
        }
    };

    const handleMessageSubmit = (event) => {
        event.preventDefault();
        const input = document.getElementById('msg-input');
        if (socket) {
            socket.emit('new_message', input.value, roomName, () => {
                // Clear the input field after sending the message
                input.value = '';
            });
        }
    };

    const handleNicknameSubmit = (event) => {
        event.preventDefault();
        const input = document.getElementById('nickname-input');
        if (socket) {
            socket.emit('nickname', input.value);
            setNickname(input.value);
            socket.emit('enter_room', roomName, showRoom);
            setShowRoomForm(false);
            const enterMessage = `${input.value} entered the ${roomName} room.`;
            addMessage(enterMessage);
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
                                        <button onClick={() => enterRoom(room)}>
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
                                    value={roomName}
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
                                        <button onClick={() => enterRoom(room)}>
                                            {room}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div id="room">
                                <h2>{roomName}</h2>
                                <h3>Participants: {participants}</h3>
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
