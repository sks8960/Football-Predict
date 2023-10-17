import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./team.css";

const Team = ({ match }) => {
  const { teamName } = useParams(); // URL 파라미터로부터 팀 이름 추출

  const [groupedStats, setGroupedStats] = useState({});

  useEffect(() => {
    const handleGetTeamStats = async () => {
      if (teamName !== "") {
        try {
          const response = await fetch(`http://localhost:5000/teams/${teamName}`);
          const data = await response.json();
          const stats = data.stats;

          const groupedStats = {};

          stats.forEach((item) => {
            const fixtureId = item.fixtureId;
            const teamName = item.teamName;
            const statistics = item.statistics;

            if (!groupedStats[fixtureId]) {
              groupedStats[fixtureId] = [];
            }

            groupedStats[fixtureId].push({ teamName, statistics });
          });
          setGroupedStats(groupedStats);
        } catch (error) {
          console.error(error);
        }
      } else {
        alert("팀 이름이 없습니다.");
      }
    };

    handleGetTeamStats();
  }, [teamName]);

  return (
    <div id="table-container">
        {Object.entries(groupedStats).map(([fixtureId, fixtureData]) => (
          <div key={fixtureId} className="fixture-table-container">
            <table
              id={`table-${fixtureId}`}
              className="fixture-table horizontal"
            >
              <thead>
                <tr>
                  <th>Type</th>
                  {fixtureData.map((data) => (
                    <th key={data.teamName}>{data.teamName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(fixtureData[0].statistics).map(([type, _]) => (
                  <tr key={type}>
                    <td>{type}</td>
                    {fixtureData.map((data) => (
                      <td key={data.teamName}>{data.statistics[type]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
  );
};

export default Team;
