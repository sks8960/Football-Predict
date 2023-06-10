import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/PostListPage1.css'; // Import a separate CSS file for styling

function PostListPage1() {
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get('/api/posts')
            .then(response => {
                setPosts(response.data);
            })
            .catch(error => {
                console.error('Error fetching posts:', error);
            });
    }, []);

    const viewPost = (postId) => {
        navigate(`/post/${postId}`);
    };

    const goToCreatePage = () => {
        navigate('/post/create');
    };

    return (
        <div>
            <h1>게시판</h1>
            <div className="post-create-button-container">
                <button onClick={goToCreatePage}>글 작성</button>
            </div>
            <div className="post-grid">
                {posts.map(post => (
                    <div key={post._id} className="post-card" onClick={() => viewPost(post._id)}>
                        <h2>{post.title}</h2>
                        <p>{post.time}</p>
                        <p>{post.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PostListPage1;
