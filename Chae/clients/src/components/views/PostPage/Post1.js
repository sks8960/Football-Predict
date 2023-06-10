import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './css/Post1.css';

function Post1() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [likes, setLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);

    useEffect(() => {
        axios.get(`/api/posts/${id}`)
            .then(response => {
                setPost(response.data);
                setLikes(response.data.likes);
                setDislikes(response.data.dislikes);
            })
            .catch(error => {
                console.error('Error fetching post:', error);
            });
    }, [id]);

    const handleLike = () => {
        axios.post(`/api/posts/${id}/like`)
            .then(response => {
                setLikes(response.data.likes);
            })
            .catch(error => {
                console.error('Error liking post:', error);
            });
    };

    const handleDislike = () => {
        axios.post(`/api/posts/${id}/dislike`)
            .then(response => {
                setDislikes(response.data.dislikes);
            })
            .catch(error => {
                console.error('Error disliking post:', error);
            });
    };

    if (!post) {
        return <div>Loading...</div>;
    }

    return (
        <div className="post-container-1">
            <h2 className="post-title-1">{post.title}</h2>
            <p className="post-content-1">{post.content}</p>
            <p className="post-time-1">{post.time}</p>
            <div className="post-buttons-1">
                <button className="like-button-1" onClick={handleLike}>
                    추천 {likes}
                </button>
                <span className="vote-count-1">
                    {likes - dislikes}
                </span>
                <button className="dislike-button-1" onClick={handleDislike}>
                    비추천 {dislikes}
                </button>
            </div>
        </div>
    );
}

export default Post1;
