import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./MyPage.css";

function MyPage() {
  const [userInfo, setUserInfo] = useState(null);
  const [currentLeague, setCurrentLeague] = useState("epl");
  const friends = [
    { id: 1, name: "test", link: "friend1" },
    { id: 2, name: "post", link: "friend2" },
    { id: 3, name: "color", link: "friend3" },
  ];
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
        console.error("유저 정보를 불러오는 데 실패했습니다:", error);
      });
  }, []);

  const handleLogoClick = () => {
    setCurrentLeague((prevLeague) => (prevLeague === "epl" ? "laliga" : "epl"));
  };

  return (
    <div className="mypage">
      {userInfo ? (
        <div className="mypage-container">
          <div className="mypage-left">
            <img
              src={userInfo.logo}
              alt="로고"
              onClick={handleLogoClick}
              style={{ cursor: "pointer" }}
              className="mypage-logo"
            />
            <h1 className="mypage-title" style={{ color: userInfo.color }}>
              {userInfo.name}
            </h1>
            <p className="mypage-info">이메일: {userInfo.email}</p>
            <p className="mypage-info">보유 포인트: {userInfo.point}</p>
            <p className="mypage-league">선호 리그 : EPL</p>

            <div className="friends-list">
              <h2>친구</h2>
              <ul>
                {friends.map((friend) => (
                  <li key={friend.id}>
                    <div className="friend-item">
                      <Link
                        to={`/friend/${friend.link}`}
                        className="friend-link"
                      >
                        {friend.name}
                      </Link>
                      <button
                        onClick={() =>
                          alert(`100포인트를 ${friend.name}에게 보냈습니다.`)
                        }
                      >
                        100포인트 보내기
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mypage-right">
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
        </div>
      ) : (
        <p>유저 정보를 불러오는 중...</p>
      )}
    </div>
  );
}

export default MyPage;
