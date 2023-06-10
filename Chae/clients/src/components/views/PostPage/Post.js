import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Post() {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ title: '', content: '' });
    const [isCreating, setIsCreating] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const navigate = useNavigate();

    const openPostListPage = () => {
        window.open('/post', '_blank');
    };

    // 게시물 목록 가져오기
    useEffect(() => {
        axios.get('/api/posts')
            .then(response => {
                setPosts(response.data);
            })
            .catch(error => {
                console.error('Error fetching posts:', error);
            });
    }, []);

    // 게시물 생성
    const createPost = () => {
        const currentTime = new Date().toISOString(); // 현재 시간을 ISO 문자열로 가져옴
        axios.post('/api/posts', { title: newPost.title, content: newPost.content, time: currentTime })
            .then(response => {
                if (response.status === 201) {
                    const newPostData = { id: response.data.id, title: newPost.title, time: currentTime };
                    setPosts([...posts, { title: newPost.title, time: currentTime }]);
                    setNewPost({ title: '', content: '' });
                    setIsCreating(false);
                    console.log(newPostData);
                    setSelectedPost(newPostData); // 생성된 게시물을 선택 상태로 설정
                    navigate(`/post/${response.data._id}`); // 새 창으로 이동하도록 경로 설정

                }
            })
            .catch(error => {
                console.error('Error creating post:', error);
            });
    };

    // 글 목록 클릭 시 상세 내용 보기
    const viewPost = (post) => {
        setSelectedPost(post);
        navigate(`/post/${post._id}`); // 새 창으로 이동하도록 경로 설정
    };

    return (
        <div>
            <h1 onClick={openPostListPage}>게시판</h1>
            <div>
                {isCreating ? (
                    <div>
                        <input
                            type="text"
                            placeholder="제목"
                            value={newPost.title}
                            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        />
                        <textarea
                            placeholder="내용"
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        ></textarea>
                        <button onClick={createPost}>작성 완료</button>
                        <button onClick={() => setIsCreating(false)}>취소</button>
                    </div>
                ) : (
                    <button onClick={() => setIsCreating(true)}>글 작성</button>
                )}
            </div>
            <table>
                <thead>
                    <tr>
                        <th>제목</th>
                        <th>작성 시간</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.map((post, index) => (
                        <tr key={index} onClick={() => viewPost(post)}>
                            <td>{post.title}</td>
                            <td>{post.time}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {selectedPost && (
                <div>
                    <h2>{selectedPost.title}</h2>
                    <p>{selectedPost.time}</p>
                    <p>{selectedPost.content}</p>
                </div>
            )}
        </div>
    );

}

export default Post;
