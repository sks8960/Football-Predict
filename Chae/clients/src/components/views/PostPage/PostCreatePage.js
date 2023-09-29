import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function PostCreatePage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [categoryList, setCategoryList] = useState([]);
    const [name, setName] = useState(''); // 추가: 현재 사용자의 username
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

        // 추가: 현재 사용자 정보를 가져오는 요청
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

        // 추가: 현재 사용자의 username을 포함하여 서버로 전달
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
        <div>
            <h1>글 작성</h1>
            <div>
                <select
                    value={category || 'epl'} // 기본값을 'epl'로 설정
                    onChange={e => setCategory(e.target.value)}
                >
                    {categoryList.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                <input
                    type="text"
                    placeholder="제목"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                <textarea
                    placeholder="내용"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                ></textarea>
                <button onClick={createPost}>
                    작성 완료
                </button>
                <button onClick={goBack}>취소</button>
            </div>
        </div>
    );
}

export default PostCreatePage;
