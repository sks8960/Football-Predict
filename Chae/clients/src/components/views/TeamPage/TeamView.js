// TeamView.js
import React from 'react';
import { useParams } from 'react-router-dom';
import TeamStat from './TeamStat';
import TeamSquad from './TeamSquad';
import TeamInfo from './TeamInfo';

function TeamView() {
  const { teamName } = useParams(); // URL에서 팀 이름 값을 추출

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
        <TeamInfo teamName={teamName} />
        </div>
        <div style={{ flex: 1 }}>
            <TeamStat teamName={teamName} /> {/* TeamStat 컴포넌트에 팀 이름 값을 props로 전달 */}
        </div>
      </div>
      <div style={{ flex: 1 }}>
          <TeamSquad teamName={teamName} />
      </div>
    </div>
  );
}

export default TeamView;
