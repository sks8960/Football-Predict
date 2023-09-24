import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TopScores.css';

const TopScores = () => {
  const [leagueData, setLeagueData] = useState({
    epl: [],
    laliga: [],
    bundesliga: [],
    seriea: [],
    ligue1: [],
  });
  const [currentLeague, setCurrentLeague] = useState('epl'); // 현재 선택한 리그
  const [loading, setLoading] = useState(false); // 데이터 로딩 상태

  // API 호출 및 데이터 가져오기 함수
  const fetchData = async () => {
    setLoading(true); // 데이터 로딩 시작

    try {
      const apiKey = '96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332';
      const apiUrl = 'https://api-football-v1.p.rapidapi.com/v3/players/topscorers';

      // 모든 리그 데이터 한 번에 가져오기
      const leaguePromises = Object.keys(leagueData).map(async (league) => {
        const response = await axios.get(apiUrl, {
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
          },
          params: {
            league: getLeagueCode(league),
            season: '2023',
          },
        });
        return {
          league,
          data: response.data.response,
        };
      });

      const leagueResponses = await Promise.all(leaguePromises);

      // 데이터를 리그별로 업데이트
      const updatedData = {};
      leagueResponses.forEach((leagueResponse) => {
        updatedData[leagueResponse.league] = leagueResponse.data;
      });

      setLeagueData(updatedData);
    } catch (error) {
      console.error('API 요청 중 오류 발생:', error);
    } finally {
      setLoading(false); // 데이터 로딩 종료
    }
  };

  // 리그 코드를 가져오는 함수
  const getLeagueCode = (league) => {
    switch (league) {
      case 'epl':
        return '39';
      case 'laliga':
        return '140';
      case 'bundesliga':
        return '78';
      case 'seriea':
        return '135';
      case 'ligue1':
        return '61';
      default:
        return '';
    }
  };

  useEffect(() => {
    fetchData(); // 초기 데이터 가져오기
  }, []);

  return (
    <div>
      <h1>리그 득점 테이블</h1>
      <div className="league-buttons">
        <button className="league-button" onClick={() => setCurrentLeague('epl')}>EPL</button>
        <button className="league-button" onClick={() => setCurrentLeague('laliga')}>La Liga</button>
        <button className="league-button" onClick={() => setCurrentLeague('bundesliga')}>Bundesliga</button>
        <button className="league-button" onClick={() => setCurrentLeague('seriea')}>Serie A</button>
        <button className="league-button" onClick={() => setCurrentLeague('ligue1')}>Ligue 1</button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="top-scores-table">
          {/* 테이블 헤더와 데이터가 여기에 표시될 것입니다 */}
          <thead>
            <tr>
              <th>순위</th>
              <th>선수 이름</th>
              <th>팀 이름</th>
              <th>골 수</th>
              <th>Penalty 득점</th>
            </tr>
          </thead>
          <tbody>
            {leagueData[currentLeague].map((scorer, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{scorer.player.name}</td>
                <td>{scorer.statistics[0].team.name}</td>
                <td>{scorer.statistics[0].goals.total}</td>
                <td>{scorer.statistics[0].penalty.scored}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TopScores;
