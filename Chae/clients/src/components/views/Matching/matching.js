import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MatchingRequestPage() {
    const [matchingRequest, setMatchingRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMatchingRequest();
    }, []);

    const fetchMatchingRequest = () => {
        axios
            .get('/api/users/auth')
            .then(response => {
                console.log(response.data)
                if (response.data.isAuth) {
                    setMatchingRequest(response.data.matchingRequests[0]);
                } else {
                    throw new Error('사용자가 인증되지 않았습니다.');
                }
            })
            .catch(error => {
                console.error(error);
                setError('매칭 요청을 불러오는 중에 오류가 발생했습니다.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const acceptMatchingRequest = () => {
        axios
            .post('/api/accept-matching-request', {
                requestId: matchingRequest._id,
                userId: matchingRequest.fromUser._id
            })
            .then(response => {
                console.log('Matching request accepted');
                // 매칭 요청을 수락하고 처리한 후에 필요한 로직을 추가하세요.
            })
            .catch(error => {
                console.error('Failed to accept matching request:', error);
            });
    };

    const rejectMatchingRequest = () => {
        axios
            .post('/api/reject-matching-request', {
                requestId: matchingRequest._id,
                userId: matchingRequest.fromUser._id
            })
            .then(response => {
                console.log('Matching request rejected');
                // 매칭 요청을 거절하고 처리한 후에 필요한 로직을 추가하세요.
            })
            .catch(error => {
                console.error('Failed to reject matching request:', error);
            });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!matchingRequest) {
        return <div>No matching request available</div>;
    }

    return (
        <div>
            <h2>Matching Request</h2>
            <p>From: {matchingRequest.fromUser.name}</p>
            <p>Date: {matchingRequest.date}</p>
            <p>Time: {matchingRequest.time}</p>
            <p>Location: {matchingRequest.location}</p>
            <button onClick={acceptMatchingRequest}>Accept</button>
            <button onClick={rejectMatchingRequest}>Reject</button>
        </div>
    );
}

export default MatchingRequestPage;
