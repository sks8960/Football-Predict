import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import "./TeamStat.css"

const TeamStat = () => {
  const { teamName } = useParams(); // URL 파라미터로부터 팀 이름 추출
  const [groupedStats, setGroupedStats] = useState({});

  useEffect(() => {
    const handleGetTeamStats = async () => {
      if (teamName !== "") {
        try {
          const response = await fetch(`http://localhost:5000/teamstat/${teamName}`);
          if (response.ok) {
            const data = await response.json();
            // 서버에서 받은 데이터를 groupedStats 상태로 설정
            setGroupedStats(data);
  
            // 데이터를 콘솔에 출력
            console.log('groupedStats:', data); // data를 출력, groupedStats가 아님
          } else {
            console.error('서버 응답 오류');
          }
        } catch (error) {
          console.error('클라이언트 측 오류:', error);
        }
      }
    };
  
    handleGetTeamStats();
  }, [teamName]);
  return (
    <div>
      {Object.keys(groupedStats).length === 0 ? (
        <p>데이터를 불러오는 중...</p>
      ) : (
<div className="table-container">
  <table className="custom-table">
  
    <tbody>
      <tr>
        <th colSpan="2" className="table-headerts">팀 통계</th>
      </tr>
      <tr>
        <td className="header">팀 이름</td>
        <td>{groupedStats.response.team.name}</td>
      </tr>
      <tr>
        <td className="header">리그</td>
        <td>{groupedStats.response.league.name}</td>
      </tr>
      <tr>
        <td className="header">클린시트</td>
        <td>{groupedStats.response.clean_sheet.total}</td>
      </tr>
      <tr>
        <td className="header">최근 승패</td>
        <td>{groupedStats.response.form}</td>
      </tr>
      <tr>
        <td className="header">골 home</td>
        <td>{groupedStats.response.goals.against.total.home}</td>
      </tr>
      <tr>
        <td className="header">골 away</td>
        <td>{groupedStats.response.goals.against.total.away}</td>
      </tr>
      <tr>
        <td className="header">최근 포메이션</td>
        <td>
          <ul>
            {groupedStats.response.lineups.map((lineup, index) => (
              <li key={index}>{lineup.formation}</li>
            ))}
          </ul>
        </td>
      </tr>
    </tbody>
  </table>
</div>


      )}
    </div>
  );
};

export default TeamStat;
