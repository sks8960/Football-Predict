import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./css/PostListPage1.css";

function PostListPage1() {
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("epl");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/api/users/auth")
      .then((response) => {
        if (response.data.isAuth) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setShowLoginAlert(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching user authentication status:", error);
      });

    axios
      .get(`/api/posts?category=${selectedCategory}&search=${searchQuery}`)
      .then((response) => {
        setPosts(response.data);
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
      });
  }, [selectedCategory, searchQuery]);
  useEffect(() => {});

  const viewPost = (postId) => {
    navigate(`/post/${postId}`);
  };

  const goToCreatePage = () => {
    if (isAuthenticated) {
      navigate("/post/create");
    } else {
      // 로그인하지 않은 경우 alert 창을 띄우고 확인 버튼을 누르면 로그인 페이지로 이동합니다.
      alert("로그인이 필요합니다.");
      window.location.href = "/login"; // 이동할 주소를 로그인 페이지 주소로 변경하세요.
    }
  };

  const handleSearch = () => {
    axios
      .get(`/api/posts/${selectedCategory}/${searchQuery}`)
      .then((response) => {
        setPosts(response.data);
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
      });
  };

  return (
    <div className="post-list-container">
      <h1>게시판</h1>
      {/* <div className="post-create-button-container">
                <button className="create-post-button" onClick={goToCreatePage}>글 작성</button>
            </div> */}
      <div className="category-buttons">
        <button
          className={`category-button ${
            selectedCategory === "epl" ? "active" : ""
          }`}
          onClick={() => setSelectedCategory("epl")}
        >
          EPL
        </button>
        <button
          className={`category-button ${
            selectedCategory === "esp" ? "active" : ""
          }`}
          onClick={() => setSelectedCategory("esp")}
        >
          LALIGA
        </button>
        <button
          className={`category-button ${
            selectedCategory === "ita" ? "active" : ""
          }`}
          onClick={() => setSelectedCategory("ita")}
        >
          SERIA A
        </button>
        <button
          className={`category-button ${
            selectedCategory === "ger" ? "active" : ""
          }`}
          onClick={() => setSelectedCategory("ger")}
        >
          BundesLiga
        </button>
        {/* 다른 카테고리 버튼들 추가 */}
      </div>
      <table className="post-table" style={tableStyle}>
        <thead>
          <tr>
            <th>카테고리</th>
            <th>제목</th>
            <th>글쓴이</th>
            <th>날짜</th>
            <th>조회수</th>
            <th>추천</th>
            <th>비추천</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post._id} onClick={() => viewPost(post._id)}>
              <td className={`post-card ${post.category}`}>
                {post.category.toUpperCase()}
              </td>
              <td>{post.title}</td>
              <td>{post.username}</td>
              <td>{formatDate(post.time)}</td> {/* 수정된 부분 */}
              <td>{post.views}</td>
              <td>{post.likeCount}</td>
              <td>{post.dislikeCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="post-create-search-container" style={flexContainerStyle}>
        <div className="search-bar" style={flexItemStyle}>
          <input
            type="text"
            placeholder="제목으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className="search-button"
            style={buttonStyle1}
            onClick={handleSearch}
          >
            검색
          </button>
        </div>
        <button
          className="create-post-button"
          style={buttonStyle2}
          onClick={goToCreatePage}
        >
          글 작성
        </button>
      </div>
    </div>
  );
}
const formatDate = (time) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };

  const formattedDate = new Date(time).toLocaleDateString("en-US", options);

  return formattedDate;
};

const flexContainerStyle = {
  display: "flex",
  justifyContent: "space-between", // 좌우로 배치
};

const flexItemStyle = {
  flex: "1", // 좌측 요소가 확장됨
};

const buttonStyle1 = {
  padding: "10px 20px", // 버튼 내용과 상하좌우 여백을 추가합니다
  width: "80px", // 버튼 폭
  height: "40px", // 버튼 높이
};

const buttonStyle2 = {
  padding: "10px 20px", // 버튼 내용과 상하좌우 여백을 추가합니다
  width: "100px", // 버튼 폭
  height: "40px", // 버튼 높이
};

const tableStyle = {
  marginTop: "20px", // 테이블 위쪽에 여백을 추가합니다
  marginBottom: "20px",
};

export default PostListPage1;
