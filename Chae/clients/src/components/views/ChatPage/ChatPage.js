import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ChatPage() {
    return (
        <>
            <header>
                <h1>Chat</h1>
            </header>
            <main>
                <div id="welcome">
                    <form>
                        <input placeholder="room name" required type="text" />
                        <button>Enter Room</button>
                    </form>
                    <h4>Open Rooms:</h4>
                    <ul></ul>
                </div>
                <div id="room">
                    <h2></h2>
                    <h3></h3>
                    <ul></ul>
                    {/* <form id="name">
            <input placeholder="nickname" required type="text" />
            <button>Save</button>
          </form> */}
                    <form id="msg">
                        <input placeholder="message" required type="text" />
                        <button>Send</button>
                    </form>
                </div>
            </main>
            <script src="/socket.io/socket.io.js"></script>
            <script src="/public/js/app.js"></script>
        </>
    );
}

export default ChatPage;
