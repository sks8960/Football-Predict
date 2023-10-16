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
    const [commentText, setCommentText] = useState(''); // 추가: 댓글 텍스트 상태
    const [comments, setComments] = useState([]); // 추가: 댓글 목록 상태
    const navigate = useNavigate();

    // 이 부분에서 댓글 내용을 가져오는 함수를 정의
    const fetchComments = async () => {
        const commentContents = [];
        for (const commentId of comments) {
            try {
                const response = await axios.get(`/api/comments/${commentId}`);
                const commentContent = response.data; // 댓글 내용을 가져옴
                commentContents.push(commentContent);
            } catch (error) {
                console.error(`Error fetching comment ${commentId}:`, error);
            }
        }
        setCommentContents(commentContents); // 댓글 내용을 상태에 업데이트
    };
    useEffect(() => {
        // 현재 사용자의 이름을 가져오기 위한 엔드포인트 호출
        axios.get('/api/users/auth')
            .then(response => {
                setCurrentUserName(response.data.name);
            })
            .catch(error => {
                console.error('Error fetching current user:', error);
            });
    }, []); // 빈 의존성 배열

    useEffect(() => {
        if (id) {
            axios.get(`/api/posts/${id}`)
                .then(response => {
                    setPost(response.data);
                    // 이미 추천 또는 비추천한 경우 상태 업데이트
                    const post = response.data;
                    const hasLiked = post.likes.some(like => like.name === currentUserName);
                    const hasDisliked = post.dislikes.some(dislike => dislike.name === currentUserName);
                    setHasLiked(hasLiked);
                    setHasDisliked(hasDisliked);
                    if (post.username === currentUserName) {
                        console.log("이름이 같습니다.");
                        setIsAuthor(true);
                    }

                    setComments(post.comments);
                })
                .catch(error => {
                    console.error('Error fetching post:', error);
                });
        }
    }, [id, currentUserName]);


    useEffect(() => {
        // comments가 변경될 때만 실행
        fetchComments();
    }, [comments]);

    const [commentContents, setCommentContents] = useState([]);


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
            // 수정 페이지로 이동
            navigate(`/post/edit/${id}`);
        } else {
            alert('작성자만 수정할 수 있습니다.');
        }
    };
    const handleCommentSubmit = async () => {
        try {
            // 댓글 작성 요청 (추가)
            const response = await axios.post(`/api/posts/${id}/comments`, { text: commentText, author: currentUserName });
            const newComment = response.data._id; // 작성한 댓글 데이터

            // 댓글 작성이 완료된 후에 댓글 입력창을 초기화
            setCommentText('');

            // 댓글 목록을 업데이트한 후에 fetchComments를 호출
            setComments(updatedComments => {
                const updatedCommentsArray = [...updatedComments, newComment];
                return updatedCommentsArray;
            });
        } catch (error) {
            console.error('Error creating comment:', error);
        }
    };



    // 댓글 삭제 함수
    const handleCommentDelete = (commentId) => {
        // 삭제 요청 보내기
        axios.delete(`/api/posts/${id}/comments/${commentId}`)
            .then(() => {
                // 댓글 목록에서 삭제된 댓글 제거
                const updatedComments = comments.filter(comment => comment._id !== commentId);
                setComments(updatedComments);
            })
            .catch(error => {
                console.error('Error deleting comment:', error);
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
                {!currentUserName ? (
                    // 로그인하지 않은 사용자의 경우 버튼을 비활성화
                    <>
                        <button className="like-button-1" disabled>추천 {post.likeCount}</button>
                        <button className="dislike-button-1" disabled>비추천 {post.dislikeCount}</button>
                    </>
                ) : (
                    <>
                        <button className="like-button-1" onClick={handleLike}>추천 {post.likeCount}</button>
                        <button className="dislike-button-1" onClick={handleDislike}>비추천 {post.dislikeCount}</button>
                    </>
                )}

                {isAuthor && (
                    <>
                        <button className="edit-button-1">
                            <Link to={`/post/edit/${id}`}>수정</Link>
                        </button>
                        <button className="delete-button-1" onClick={handleDelete}>
                            삭제
                        </button>
                    </>
                )}
            </div>
            {currentUserName && (
                <div className="comment-section">
                    <h3>댓글</h3>
                    <textarea
                        rows="4"
                        placeholder="댓글을 작성하세요."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                    ></textarea>
                    <button className="comment-button" onClick={handleCommentSubmit}>
                        작성
                    </button>
                </div>
            )}

            {/* 댓글 목록 표시 부분 (추가) */}
            {commentContents.length > 0 && (
                <div className="comments">
                    <h4>댓글 목록</h4>
                    <ul>
                        {commentContents.map((comment) => (
                            <li key={comment._id}>
                                <div className="comment-header">
                                    <p className="comment-author">{comment.author}</p>
                                    <p className="comment-time">{comment.createdAt}</p>
                                    {comment.author === currentUserName && (
                                        <button
                                            className="delete-comment-button"
                                            onClick={() => handleCommentDelete(comment._id)}
                                        >
                                            삭제
                                        </button>
                                    )}
                                </div>
                                <p className="comment-text">{comment.text}</p>
                                {/* 대댓글 작성 부분을 추가할 수 있음 */}
                                {/* 댓글 삭제 또는 수정 버튼 추가 가능 */}
                            </li>
                        ))}

                    </ul>
                </div>
            )}


        </div>
    );
}

export default Post1;