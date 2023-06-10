import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function PostCreatePage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const navigate = useNavigate();

    const createPost = () => {
        const currentTime = new Date().toISOString();
        axios
            .post('/api/posts', { title, content, time: currentTime })
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