import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/PostListPage1.css';

function PostListPage1() {
    const [posts, setPosts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('epl');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLoginAlert, setShowLoginAlert] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get('/api/users/auth')
            .then(response => {
                if (response.data.isAuth) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                    setShowLoginAlert(true);
                }
            })
            .catch(error => {
                console.error('Error fetching user authentication status:', error);
            });

        axios
            .get(`/api/posts?category=${selectedCategory}&search=${searchQuery}`)
            .then(response => {
                setPosts(response.data);
            })
            .catch(error => {
                console.error('Error fetching posts:', error);
            });
    }, [selectedCategory, searchQuery]);

    const viewPost = (postId) => {
        navigate(`/post/${postId}`);
    };

    const goToCreatePage = () => {
        if (isAuthenticated) {
            navigate('/post/create');
        } else {
            setShowLoginAlert(true);
        }
    };

    const handleSearch = () => {
        axios.get(`/api/posts/${selectedCategory}/${searchQuery}`)
            .then(response => {
                setPosts(response.data);
            })
            .catch(error => {
                console.error('Error fetching posts:', error);
            });
    };

    return (
        <div>
            <h1>게시판</h1>
            <div className="post-create-button-container">
                <button onClick={goToCreatePage}>글 작성</button>
                {showLoginAlert && <p>로그인이 필요합니다.</p>}
            </div>
            <div className="category-buttons">
                <button onClick={() => setSelectedCategory('epl')}>EPL</button>
                <button onClick={() => setSelectedCategory('esp')}>ESP</button>
                <button onClick={() => setSelectedCategory('ita')}>ITA</button>
                <button onClick={() => setSelectedCategory('ger')}>GER</button>
                {/* 다른 카테고리 버튼들 추가 */}
            </div>
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="제목으로 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={handleSearch}>검색</button>
            </div>
            <div className="post-grid">
                {posts.map(post => (
                    <div key={post._id} className="post-card" onClick={() => viewPost(post._id)}>
                        <h2>{post.title}</h2>
                        <p>{post.category}</p>
                        <p>글쓴이: {post.username}</p>
                        <p>날짜: {post.time}</p>
                        <p>조회: {post.views}</p>
                        <p>추천: {post.likeCount}</p>
                        <p>비추천: {post.dislikeCount}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PostListPage1;
