import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PostListPage() {
    const [posts, setPosts] = useState([]);

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

    return (
        <div>
            <h1>글 목록</h1>
            <ul>
                {posts.map(post => (
                    <li key={post.id}>
                        <a href={`/post/${post.id}`}>{post.title}</a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default PostListPage;
