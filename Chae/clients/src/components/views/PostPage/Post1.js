import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './css/Post1.css';

function Post1() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [hasLiked, setHasLiked] = useState(false);
    const [hasDisliked, setHasDisliked] = useState(false);
    const [currentUserName, setCurrentUserName] = useState('');
    const [isAuthor, setIsAuthor] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        // 현재 사용자의 이름을 가져오기 위한 엔드포인트 호출
        axios.get('/api/users/auth')
            .then(response => {
                setCurrentUserName(response.data.name);
            })
            .catch(error => {
                console.error('Error fetching current user:', error);
            });

        axios.get(`/api/posts/${id}`)
            .then(response => {
                setPost(response.data);
                // 이미 추천 또는 비추천한 경우 상태 업데이트
                setHasLiked(response.data.likes.some(like => like.name === currentUserName));
                setHasDisliked(response.data.dislikes.some(dislike => dislike.name === currentUserName));
                console.log(response.data)
                if (response.data.username === currentUserName) {
                    console.log("이름이 같습니다.");
                    setIsAuthor(true);
                }
            })
            .catch(error => {
                console.error('Error fetching post:', error);
            });
    }, [id, currentUserName]);

    const handleLike = () => {
        if (!hasLiked) {
            axios.post(`/api/posts/${id}/like`)
                .then(response => {
                    // 클라이언트에서 likeCount를 업데이트
                    post.likeCount = response.data.likeCount;
                    setHasLiked(true);
                    if (hasDisliked) {
                        console.log("비추천 존재합니다");
                        // 이미 비추천한 경우, 비추천을 취소
                        handleCancelDislike();
                    }
                })
                .catch(error => {
                    console.error('Error liking post:', error);
                });
        } else {
            // 이미 추천한 경우, 추천 취소
            handleCancelLike();

            // 이미 추천한 경우 알람을 표시
            // alert('이미 추천한 게시물입니다.');
        }
    };
    const handleDislike = () => {
        if (!hasDisliked) {
            axios.post(`/api/posts/${id}/dislike`)
                .then(response => {
                    // 클라이언트에서 dislikeCount를 업데이트
                    post.dislikeCount = response.data.dislikeCount;
                    setHasDisliked(true);
                    if (hasLiked) {
                        // 이미 추천한 경우, 추천을 취소
                        console.log("추천 존재합니다");
                        handleCancelLike();
                    }
                })
                .catch(error => {
                    console.error('Error disliking post:', error);
                });
        } else {
            // 이미 비추천한 경우, 비추천 취소
            handleCancelDislike();
        }
    };

    const handleCancelLike = () => {
        // 추천 취소 로직 구현
        axios.post(`/api/posts/${id}/cancelLike`)
            .then(response => {
                console.log("추천 취소.");
                // 클라이언트에서 likeCount를 업데이트
                post.likeCount = response.data.likeCount;
                setHasLiked(false);
            })
            .catch(error => {
                console.error('Error cancelling like:', error);
            });
    };

    const handleCancelDislike = () => {
        // 비추천 취소 로직 구현
        axios.post(`/api/posts/${id}/cancelDislike`)
            .then(response => {
                console.log("비추천 취소.")
                // 클라이언트에서 dislikeCount를 업데이트
                post.dislikeCount = response.data.dislikeCount;
                setHasDisliked(false);
            })
            .catch(error => {
                console.error('Error cancelling dislike:', error);
            });
    };
    const handleDelete = () => {
        // 작성자만 삭제할 수 있도록 확인
        if (isAuthor) {
            axios.delete(`/api/posts/${id}`)
                .then(() => {
                    navigate('/');
                    // 삭제가 성공하면 홈 페이지로 이동 또는 다른 작업 수행
                    // 예: navigate('/home') 또는 alert('포스트가 삭제되었습니다.');
                })
                .catch(error => {
                    console.error('Error deleting post:', error);
                });
        } else {
            alert('작성자만 삭제할 수 있습니다.');
        }
    };
    const handleEdit = () => {
        // 작성자만 수정할 수 있도록 확인
        if (isAuthor) {
            console.log("수정합니다");
            // 수정 페이지로 이동하거나 다른 작업 수행
            // 예: navigate(`/edit/${id}`) 또는 다른 작업
        } else {
            alert('작성자만 수정할 수 있습니다.');
        }
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
                {currentUserName && (
                    <>
                        <button className="like-button-1" onClick={handleLike}>
                            추천 {post.likeCount}
                        </button>
                        <span className="vote-count-1">
                            {post.likeCount - post.dislikeCount}
                        </span>
                        <button className="dislike-button-1" onClick={handleDislike}>
                            비추천 {post.dislikeCount}
                        </button>
                    </>
                )}
                {isAuthor && (
                    <>
                        <button className="edit-button-1" onClick={handleEdit}>
                            수정
                        </button>
                        <button className="delete-button-1" onClick={handleDelete}>
                            삭제
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default Post1;
