import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

function ChatPage() {
    const [roomName, setRoomName] = useState('');
    const [roomList, setRoomList] = useState([]);
    const navigate = useNavigate();
    const socket = io('http://localhost:5000');

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

        // 실시간으로 방 목록 업데이트 받기
        socket.on('roomListUpdated', (data) => {
            const updatedRoomList = data.roomList;
            setRoomList(updatedRoomList);
        });

        return () => {
            // 컴포넌트가 언마운트될 때 소켓 연결 해제
            socket.disconnect();
        };
    }, []);

    const handleEnterRoom = async () => {
        const existingRoom = roomList.find((room) => room.name === roomName);

        if (existingRoom) {
            // 이미 존재하는 방에 입장
            navigate(`/chat/room?id=${existingRoom.id}`);
        } else {
            try {
                const response = await axios.post('/api/chat/createRoom', { roomName });
                const { success, createdRoom, message } = response.data;

                if (success) {
                    navigate(`/chat/room?id=${createdRoom.id}`);
                } else {
                    console.log(message);
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <div>
            <h2>채팅 페이지</h2>
            <div>
                <label htmlFor="roomName">Room</label>
                <input
                    type="text"
                    id="roomName"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                />
                <button onClick={handleEnterRoom}>입장</button>
            </div>
            <div>
                <h3>Room 목록</h3>
                <ul>
                    {roomList.map((room) => (
                        <li key={room.id}>
                            <Link to={`/chat/room?id=${room.id}`}>
                                {room.name} ({room.usersCount})
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default ChatPage;
