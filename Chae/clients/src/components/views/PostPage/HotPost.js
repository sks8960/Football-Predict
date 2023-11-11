import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./css/HotPost.css";

function getTimeDifference(time) {
  const currentTime = new Date();
  const postTime = new Date(time);
  const timeDifference = Math.floor(
    (currentTime - postTime) / (60 * 60 * 1000)
  ); // 시간으로 변환
  if (timeDifference === 1) {
    return "1 시간 전";
  } else if (timeDifference > 1) {
    return `${timeDifference} 시간 전`;
  }
  return "방금 전";
}

function PostList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get("/api/hotposts").then((response) => {
      setPosts(response.data);
    });
  }, []);

  return (
    <div className="post-list-container">
      <h1 className="post-list-title">최근 게시판</h1>
      <ol className="post-list">
        {posts.map((post) => (
          <li key={post._id} className="post-item">
            <Link to={`/post/${post._id}`} className="custom-link">
              <div className="post-title">
                {post.title} [{post.comments.length}]
              </div>
              <div className="post-details">
                작성자: {post.username} · 작성 시간:{" "}
                {getTimeDifference(post.time)}
              </div>
              <div className="post-likes-dislikes">
                Likes: {post.likeCount} · Dislikes: {post.dislikeCount}
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default PostList;
