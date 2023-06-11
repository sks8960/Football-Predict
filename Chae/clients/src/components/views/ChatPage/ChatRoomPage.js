import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import axios from 'axios';

function ChatRoomPage() {
    const location = useLocation();
    const roomId = queryString.parse(location.search).roomId;
    const [room, setRoom] = useState(null);

    useEffect(() => {
        const getRoomInfo = async (roomId) => {
            try {
                const response = await axios.get(`/api/chat/rooms/${roomId}`);
                const roomData = response.data;
                setRoom(roomData);
            } catch (error) {
                console.error(error);
            }
        };

        getRoomInfo(roomId);
    }, [roomId]);

    if (!room) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>{room.name} ({room.users.length}명)</h2>
            <div>
                {/* 채팅 내역 표시 */}
            </div>
        </div>
    );
}

export default ChatRoomPage;
