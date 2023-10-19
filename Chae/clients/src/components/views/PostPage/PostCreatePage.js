import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './css/PostCreatePage.css'; // CSS 파일을 import

function PostCreatePage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('epl');
    const [categoryList, setCategoryList] = useState([]);
    const [name, setName] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const categoryFromQuery = queryParams.get('category');
        if (categoryFromQuery) {
            setCategory(categoryFromQuery);
        }
        axios
            .get('/api/categories')
            .then(response => {
                setCategoryList(response.data);
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
            });

        axios
            .get('/api/users/auth')
            .then(response => {
                if (response.data.isAuth) {
                    setName(response.data.name);
                }
            })
            .catch(error => {
                console.error('Error fetching user information:', error);
            });
    }, [location.search]);

    const createPost = () => {
        const currentTime = new Date().toISOString();
        axios
            .post('/api/posts', { title, content, category, time: currentTime, username: name })
            .then(response => {
                if (response.status === 201) {
                    navigate(`/post`);
                }
            })
            .catch(error => {
                console.error('Error creating post:', error);
            });
    };

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div className="post-create-container">
            <h1>글 작성</h1>
            <div className="post-create-form">
                <label>카테고리:</label>
                <select
                    className="select-category"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                >
                    {categoryList.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <label>제목:</label>
                <input
                    type="text"
                    className="input-title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                <label>내용:</label>
                <textarea
                    rows="4"
                    className="input-content"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                ></textarea>
                <div className="button-container">
                    <button className="cancel-button" onClick={goBack}>취소</button>
                    <button className="create-button" onClick={createPost}>작성 완료</button>
                </div>
            </div>
        </div>
    );
}

export default PostCreatePage;
