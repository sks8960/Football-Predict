import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './TeamSquad.css'; // 테이블 스타일링을 위한 CSS 파일 import

const TeamSquad = () => {
  const { teamName } = useParams();
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const handleGetTeamSquads = async () => {
      if (teamName !== "") {
        try {
          const response = await fetch(`http://localhost:5000/teamsquad/${teamName}`);
          if (response.ok) {
            const data = await response.json();
            console.log(data);
            setPlayers(data.response[0].players);
          } else {
            console.error('서버 응답 오류');
          }
        } catch (error) {
          console.error('클라이언트 측 오류:', error);
        }
      }
    };

    handleGetTeamSquads();
  }, [teamName]);

  return (
    <div className="team-squad-container">
      {players.length > 0 ? (
        <div className="table-containerts">
          <table>
          <thead>
              <tr>
                <th colSpan="4" className="table-headerts">팀 선수 목록</th>
              </tr>
              <tr>
                <th>선수 이름</th>
                <th>포지션</th>
                <th>나이</th>
                <th>등번호</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={index}>
                  <td>{player.name}</td>
                  <td>{player.position}</td>
                  <td>{player.age}</td>
                  <td>{player.number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>선수 데이터를 불러오는 중...</p>
      )}
    </div>
  );
};

export default TeamSquad;
