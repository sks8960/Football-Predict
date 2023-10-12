import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StandingsTable.css';

const StandingsTable = () => {
  const [leagueId, setLeagueId] = useState(39); // 초기 리그 ID (EPL)
  const [leagueData, setLeagueData] = useState({});
  const [loading, setLoading] = useState(false);

  const leagues = [
    { id: 39, name: 'EPL' },
    { id: 140, name: 'La Liga' },
    { id: 78, name: 'Bundesliga' },
    { id: 135, name: 'Serie A' },
    { id: 61, name: 'Ligue 1' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const apiKey = '96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332';
        const leagueDataPromises = leagues.map(async (league) => {
          const standingsResponse = await axios.get(
            `https://api-football-v1.p.rapidapi.com/v3/standings?league=${league.id}&season=2023`,
            {
              headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
              },
            }
          );
          const standings = standingsResponse.data.response[0].league.standings[0];
          return { leagueId: league.id, standings };
        });

        const leagueDataArray = await Promise.all(leagueDataPromises);
        const leagueDataObject = {};

        leagueDataArray.forEach((data) => {
          leagueDataObject[data.leagueId] = data.standings;
        });

        setLeagueData(leagueDataObject);
        setLoading(false);
      } catch (error) {
        console.error('API 요청 중 오류 발생:', error);
        setLoading(false);
      }
    };

    if (Object.keys(leagueData).length === 0) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [leagueData, leagues]);

  return (
    <div className="standings-table-container">
      <div className="league-buttons">
        {leagues.map((league) => (
          <button
            key={league.id}
            className={`league-button ${leagueId === league.id ? 'active' : ''}`}
            onClick={() => setLeagueId(league.id)}
          >
            {league.name}
          </button>
        ))}
      </div>
      <div className="table-container">
        <table className="standings-table">
          <thead>
            <tr>
              <th>순위</th>
              <th>팀 이름</th>
              <th>경기 수</th>
              <th>승리 수</th>
              <th>비긴 수</th>
              <th>패배 수</th>
              <th>골 득실 차</th>
              <th>포인트</th>
            </tr>
          </thead>
          <tbody>
            {leagueData[leagueId] ? (
              leagueData[leagueId].map((team, index) => (
                <tr key={index}>
                  <td>{team.rank}</td>
                  <td>{team.team.name}</td>
                  <td>{team.all.played}</td>
                  <td>{team.all.win}</td>
                  <td>{team.all.draw}</td>
                  <td>{team.all.lose}</td>
                  <td>{team.goalsDiff}</td>
                  <td>{team.points}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">데이터가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StandingsTable;
