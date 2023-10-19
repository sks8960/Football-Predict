import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LandingPage from './components/views/LandingPage/LandingPage';
import LoginPage from './components/views/LoginPage/LoginPage';
import RegisterPage from './components/views/RegisterPage/RegisterPage';
import Chat_Page_Login from './components/views/Chat_Page/Chat_Page_Login';
import PostListPage from './components/views/PostPage/PostListPage';
import PostPage from './components/views/PostPage/Post';
import PostListPage1 from './components/views/PostPage/PostListPage1';
import Post1 from './components/views/PostPage/Post1';
import PostCreatePage from './components/views/PostPage/PostCreatePage'; // Import the PostCreatePage component
import ChatPage from './components/views/ChatPage/ChatPage';
import CalEpl from './components/views/callender/CalEpl';
import CalLaliga from './components/views/callender/CalLaliga';
import CalLigue1 from './components/views/callender/CalLigue1';
import CalSeriea from './components/views/callender/CalSeriea';
import CalBundesliga from './components/views/callender/CalBundesliga';
import Team from './components/views/TeamPage/Team';
import ChatRoomPage from './components/views/ChatPage/ChatRoomPage';
import Chat from "./components/views/ChatPage/Chat"
import UserList from './components/views/UserList/UserList';
import Matching from "./components/views/Matching/matching";
import EditPost from "./components/views/PostPage/EditPost"
import TopScores from './components/views/TopPlayers/TopScores'
import TopAssists from './components/views/TopPlayers/TopAssists';

import Navbar from "./mainpage/Navbar";
import TopPlayers from './components/views/TopPlayers/TopPlayers';
import TeamRank from "./components/views/TeamRank/TeamRank";

import Space1 from './components/views/HomPage/Space1';
import Space2 from './components/views/HomPage/Space2';
import Space3 from './components/views/HomPage/Space3';
import Space4 from './components/views/HomPage/Space4';
import './components/views/HomPage/Quadrants.css';

import HotPost from './components/views/PostPage/HotPost'

import Footer from './components/views/Footer/Footer'
/* 홈페이지 레이아웃 사분면으로 구현 */
function Quadrants() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* 왼쪽 절반 (Space1) */}
      <div style={{ flex: 1, backgroundColor: "yellow" }}>
        <HotPost />
      </div>

      {/* 오른쪽 절반을 가로로 나눔 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 위쪽 절반 (Space2) */}
        <div style={{ flex: 1, backgroundColor: "green" }}>
          <TopPlayers />
        </div>

        {/* 아래쪽 절반 (Space3) */}
        <div style={{ flex: 1, backgroundColor: "orange" }}>
          <TeamRank />
        </div>
      </div>
    </div>
  );
}


function App() {
  return (
    <div>
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Quadrants />} />
        <Route exact path="/login" element={<LoginPage />} />
        <Route exact path="/register" element={<RegisterPage />} />
        {/* <Route exact path="/chat" element={<Chat_Page_Login />} /> */}
        <Route path="/post" element={<PostListPage1 />} />
        <Route path="/post/create" element={<PostCreatePage />} /> // Add the route for PostCreatePage
        <Route path="/post/:id" element={<Post1 />} />
        <Route path='/chat' element={<Chat />} />
        <Route exact path="/chat/:roomId" component={ChatRoomPage} />
        <Route exact path='/cal/epl' element={<CalEpl />} />
        <Route exact path='/cal/laliga' element={<CalLaliga />} />
        <Route exact path='/cal/ligue1' element={<CalLigue1 />} />
        <Route exact path='/cal/seriea' element={<CalSeriea />} />
        <Route exact path='/cal/bundesliga' element={<CalBundesliga />} />
        <Route exact path='/team/:teamName' element={<Team />} />
        <Route exact path='/userlist' element={<UserList />} />
        <Route exact path="/usermatch" element={<Matching />} />
        <Route path="/post/edit/:id" element={<EditPost />} />

      </Routes>
      <Footer />
    </div>
  );
}

export default App;
