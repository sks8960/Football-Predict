import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Auth from "../../../hoc/auth"
import { Link } from 'react-router-dom';

function LandingPage() {
    const navigate = useNavigate();
    // useEffect(() => {
    //     axios
    //         .get('/api/users/auth')
    //         .then(response => {
    //             const id = document.getElementById("out");
    //             if (response.data.isAuth) {
    //                 id.hidden = false;
    //             }
    //             else
    //                 id.hidden = true;
    //         })
    //         .catch(error => console.error(error)); // 에러 처리를 추가했습니다.
    // }, []);
    const [isIdVisible, setIsIdVisible] = useState(false);
    useEffect(() => {
        axios
            .get('/api/users/auth')
            .then(response => {
                if (response.data.isAuth) {
                    setIsIdVisible(true);
                } else {
                    setIsIdVisible(false);
                }
            })
            .catch(error => {
                console.error(error);
                setIsIdVisible(false);
            });
    }, []);

    const onClickHandler = () => {
        axios.get('/api/users/logout')
            .then(response => {
                if (response.data.success) {
                    alert("로그아웃 되었습니다.")
                    setIsIdVisible(false);
                    navigate('/');
                } else {
                    alert('로그아웃 하는데 실패 했습니다.')
                }

            })
    }
    return (
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            position: "static",
            width: "100%", height: "100vh"
        }}><div>
                <h2>시작페이지</h2>
                {isIdVisible && <button id="out" onClick={onClickHandler}>Logout</button>}
            </div>
            <div>
                <ul>
                    <li>
                        <Link to="/Login">로그인</Link>
                    </li>
                    <li>
                        <Link to="/Register">회원가입</Link>
                    </li>
                    <li>
                        <Link to="/post">게시판</Link>
                    </li>
                    <li>
                        <Link to="chat">채팅</Link>
                    </li>
                    <li>
                        <Link to="cal/epl">잉글랜드</Link>
                    </li>
                    <li>
                        <Link to="cal/laliga">스페인</Link>
                    </li>
                    <li>
                        <Link to="cal/ligue1">프랑스</Link>
                    </li>
                    <li>
                        <Link to="cal/seriea">이탈리아</Link>
                    </li>
                    <li>
                        <Link to="cal/bundesliga">독일</Link>
                    </li>
                    <li>
                        <Link to="team">팀 분석</Link>
                    </li>
                </ul>
                <hr />
            </div>
        </div >)

}

export default Auth(LandingPage, null);
