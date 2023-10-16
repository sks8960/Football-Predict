import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Button.css";
import axios from "axios";

function Button() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    // 컴포넌트가 마운트될 때 쿠키 확인 수행
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('/api/users/auth');
        if (response.data.isAuth) {
          setIsAuthenticated(true); // 사용자가 인증된 경우
        } else {
          setIsAuthenticated(false); // 사용자가 인증되지 않은 경우
        }
      } catch (error) {
        console.error(error);
        setIsAuthenticated(false); // 에러 발생 시 인증되지 않은 것으로 처리
      }
    };

    checkAuthStatus();

  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      const response = await axios.get('/api/users/logout');
      if (response.data.success) {
        setIsAuthenticated(false);
        alert("로그아웃 되었습니다.");

      } else {
        alert('로그아웃 하는데 실패 했습니다.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <button className="logout" onClick={handleLogout}>Logout</button>
      ) : (
        <Link to="login">
          <button className="btn">Login</button>
        </Link>
      )}
    </div>
  );
}

export default Button;
