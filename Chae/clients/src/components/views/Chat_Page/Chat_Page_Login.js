import React, { useEffect } from 'react';

function ChatPageLogin() {
    // useEffect(() => {
    //     const script = document.createElement('script');
    //     script.src = '../../public/js/app.js';
    //     document.head.appendChild(script);

    //     // 컴포넌트 언마운트 시 스크립트 제거
    //     return () => {
    //         document.head.removeChild(script);
    //     };
    // }, []);

    return (
        <div>
            <header>
                <h1>Noom</h1>
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
                    <h3> </h3>
                    <ul></ul>
                    <form id="name">
                        <input placeholder="nickname" required type="text" />
                        <button>Save</button>
                    </form>
                    <form id="msg">
                        <input placeholder="message" required type="text" />
                        <button>Send</button>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default ChatPageLogin;
