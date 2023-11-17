import React, { useEffect, useState } from 'react';
import { useParams, Link  } from 'react-router-dom';
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
            console.log(data);
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
        <h2><Link to={`/team/${teamData.team.name}`} style={linkStyle}>
          {teamData.team.name}
          </Link>
        </h2>
        <p>국가: {teamData.team.country}</p>
        <p>설립 년도: {teamData.team.founded}년</p>
        <p>홈 구장: {teamData.venue.name}</p>
        <p>홈 구장 주소: {teamData.venue.address}</p>
        <p>수용 인원: {teamData.venue.capacity}명</p>
        {/* 다른 팀 정보 항목을 여기에 추가할 수 있습니다 */}
      </div>
    </div>
  );
};

export default TeamInfo;



const linkStyle = {
  color: 'black', // 링크 텍스트 색상을 검은색으로 지정
  textDecoration: 'none', // 밑줄을 없앰
};