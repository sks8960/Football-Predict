import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './css/EditPost.css';

function EditPost() {
    const { id } = useParams();
    const [post, setPost] = useState({});
    const [newContent, setNewContent] = useState(''); // 수정할 내용을 저장할 상태

    const navigate = useNavigate();

    useEffect(() => {
        // 게시물 내용을 불러오는 요청
        axios.get(`/api/posts/${id}`)
            .then(response => {
                setPost(response.data);
                setNewContent(response.data.content); // 현재 내용을 상태에 저장
            })
            .catch(error => {
                console.error('Error fetching post for editing:', error);
            });
    }, [id]);

    const handleContentChange = (e) => {
        setNewContent(e.target.value);
    };

    const handleEdit = () => {
        // 수정된 내용을 서버로 보내는 요청
        axios.put(`/api/posts/${id}`, { content: newContent })
            .then(() => {
                navigate(`/post/${id}`); // 수정이 완료되면 해당 게시물 페이지로 돌아가기
            })
            .catch(error => {
                console.error('Error editing post:', error);
            });
    };

    return (
        <div className="edit-post-container">
            <h2>{post.title}</h2>
            <textarea
                rows="6"
                value={newContent}
                onChange={handleContentChange}
            ></textarea>
            <button onClick={handleEdit}>수정 완료</button>
        </div>
    );
}

export default EditPost;