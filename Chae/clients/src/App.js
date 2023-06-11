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
function App() {
  return (
    <div>
      <Routes>
        <Route exact path="/" element={<LandingPage />} />
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
        <Route exact path='/team' element={<Team />} />
        <Route exact path='/userlist' element={<UserList />} />
        <Route exact path="/usermatch" element={<Matching />} />
      </Routes>
    </div>
  );
}

export default App;
