import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./MyPage.css";

function MyPage() {
  const [userInfo, setUserInfo] = useState(null);
  const [currentLeague, setCurrentLeague] = useState("epl");
  const fixedRecentPosts = [
    { id: 1, title: "맨유 충격 역전패", link: "654c717fed229b2f1b0a8bfb" },
    { id: 2, title: "바르셀로나 유로파 각", link: "654c7174ed229b2f1b0a8bd3" },
    {
      id: 3,
      title: "첼시는 챔스 왜 못나감?",
      link: "6533600cce75c02c55ec40fd",
    },
    { id: 4, title: "산초 바르사에서 임대", link: "65335ffbce75c02c55ec40d9" },
    {
      id: 5,
      title: "이번 챔스 우승은 레알일듯",
      link: "65335fdace75c02c55ec4090",
    },
  ];

  useEffect(() => {
    axios
      .get("/api/users/auth")
      .then((response) => {
        setUserInfo(response.data);
      })
      .catch((error) => {
        console.error("Failed to fetch user:", error);
      });
  }, []);

  const handleLogoClick = () => {
    // Toggle between "epl" and "laliga" on logo click
    setCurrentLeague((prevLeague) => (prevLeague === "epl" ? "laliga" : "epl"));
  };

  return (
    <div className="mypage">
      {userInfo ? (
        <div id="user-info" className="mypage-user-info">
          {/* Logo with onClick handler */}
          <img
            src={userInfo.logo}
            alt="로고"
            onClick={handleLogoClick}
            style={{ cursor: "pointer" }}
          />
          {/* Display current league */}
          <h1 className="mypage-title" style={{ color: userInfo.color }}>
            {currentLeague}
          </h1>
          <p className="mypage-info">Email: {userInfo.email}</p>
          <p className="mypage-info">보유 포인트: {userInfo.point}</p>

          {/* Display fixed recent posts */}
          {fixedRecentPosts ? (
            <div className="recent-posts">
              <h2>최근 게시물</h2>
              <ul>
                {fixedRecentPosts.map((post) => (
                  <li key={post.id}>
                    <Link to={`/post/${post.link}`} className="post-link">
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>작성한 게시물이 없습니다.</p>
          )}
        </div>
      ) : (
        <p>Loading user information...</p>
      )}
    </div>
  );
}

export default MyPage;
