import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './TeamInfo.css'; // 스타일 파일을 import

const TeamInfo = () => {
  const { teamName } = useParams();
  const [teamData, setTeamData] = useState({ team: {}, venue: {} });

  useEffect(() => {
    const fetchData = async () => {
      if (teamName !== "") {
        try {
          const response = await fetch(`http://localhost:5000/teaminfo/${teamName}`);
          if (response.ok) {
            const data = await response.json();
            setTeamData(data.response[0]);
          } else {
            console.error('서버 응답 오류');
          }
        } catch (error) {
          console.error('클라이언트 측 오류:', error);
        }
      }
    };

    fetchData();
  }, [teamName]);

  return (
    <div className="team-info-container">
      <div className="team-logo">
        <img src={teamData.team.logo} alt={`${teamData.team.name} 로고`} />
      </div>
      <div className="team-details">
        <h2>{teamData.team.name}</h2>
        <p>팀 ID: {teamData.team.id}</p>
        <p>국가: {teamData.team.country}</p>
        <p>설립 년도: {teamData.team.founded}</p>
        <p>홈 구장: {teamData.venue.name}</p>
        <p>홈 구장 주소: {teamData.venue.address}</p>
        <p>수용 인원: {teamData.venue.capacity}</p>
        <p>구장 표면: {teamData.venue.surface}</p>
        {/* 다른 팀 정보 항목을 여기에 추가할 수 있습니다 */}
      </div>
    </div>
  );
};

export default TeamInfo;
