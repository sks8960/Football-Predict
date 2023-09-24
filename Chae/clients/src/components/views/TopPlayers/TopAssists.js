import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TopAssists.css';

const TopAssists = () => {
  const [leagueData, setLeagueData] = useState({
    epl: [],
    laliga: [],
    bundesliga: [],
    seriea: [],
    ligue1: [],
  });
  const [currentLeague, setCurrentLeague] = useState('epl'); // 현재 선택한 리그

  // API 호출 및 데이터 가져오기 함수
  const fetchData = async () => {
    try {
      const apiKey = '96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332';
      const apiUrl = 'https://api-football-v1.p.rapidapi.com/v3/players/topassists';

      // 모든 리그 데이터 한 번에 가져오기
      const leaguePromises = Object.keys(leagueData).map((league) =>
        axios.get(apiUrl, {
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
          },
          params: {
            league: getLeagueCode(league),
            season: '2023',
          },
        })
      );

      const responses = await Promise.all(leaguePromises);

      responses.forEach((response, index) => {
        const league = Object.keys(leagueData)[index];
        const data = response.data;

        if (data && data.response && data.response.length > 0) {
          setLeagueData((prevData) => ({
            ...prevData,
            [league]: data.response,
          }));
        } else {
          console.log(`${league} 데이터를 찾을 수 없습니다.`);
        }
      });
    } catch (error) {
      console.error('API 요청 중 오류 발생:', error);
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

  // 테이블 헤더 업데이트 함수
  const updateTableHeader = (league) => {
    setCurrentLeague(league);
  };

  useEffect(() => {
    fetchData(); // 초기 데이터 가져오기
  }, []);

  return (
    <div>
      <h1>리그 어시스트 순위 테이블</h1>
      <div className="league-buttons">
        <button className="league-button" onClick={() => setCurrentLeague('epl')}>EPL</button>
        <button className="league-button" onClick={() => setCurrentLeague('laliga')}>La Liga</button>
        <button className="league-button" onClick={() => setCurrentLeague('bundesliga')}>Bundesliga</button>
        <button className="league-button" onClick={() => setCurrentLeague('seriea')}>Serie A</button>
        <button className="league-button" onClick={() => setCurrentLeague('ligue1')}>Ligue 1</button>
      </div>
      <table className="top-assists-table">
        {/* 테이블 헤더와 데이터가 여기에 표시될 것입니다 */}
        <thead>
          <tr>
            <th>순위</th>
            <th>선수 이름</th>
            <th>팀 이름</th>
            <th>어시스트 수</th>
            <th>키 패스</th>
          </tr>
        </thead>
        <tbody>
          {leagueData[currentLeague].map((assistant, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{assistant.player.name}</td>
              <td>{assistant.statistics[0].team.name}</td>
              <td>{assistant.statistics[0].goals.assists}</td>
              <td>{assistant.statistics[0].passes.key}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopAssists;
