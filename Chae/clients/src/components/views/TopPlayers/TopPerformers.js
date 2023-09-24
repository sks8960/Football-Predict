/* 득점 및 어시스트 테이블 교체 방식 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TopScorersTable = ({ leagueData, currentLeague }) => {
  return (
    <table id="table">
      <thead>
        <tr>
          <th>선수 이름</th>
          <th>팀 이름</th>
          <th>골 수</th>
        </tr>
      </thead>
      <tbody>
        {leagueData[currentLeague].map((scorer, index) => (
          <tr key={index}>
            <td>{scorer.player.name}</td>
            <td>{scorer.statistics[0].team.name}</td>
            <td>{scorer.statistics[0].goals.total}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const TopAssistantsTable = ({ leagueData, currentLeague }) => {
  return (
    <table id="table">
      <thead>
        <tr>
          <th>선수 이름</th>
          <th>팀 이름</th>
          <th>어시스트 수</th>
        </tr>
      </thead>
      <tbody>
        {leagueData[currentLeague].map((assistant, index) => (
          <tr key={index}>
            <td>{assistant.player.name}</td>
            <td>{assistant.statistics[0].team.name}</td>
            <td>{assistant.statistics[0].goals.assists}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const TopPerformers = () => {
  const [leagueData, setLeagueData] = useState({
    epl: [],
    laliga: [],
    bundesliga: [],
    seriea: [],
    ligue1: [],
  });
  const [currentLeague, setCurrentLeague] = useState('epl');
  const [currentCategory, setCurrentCategory] = useState('topScorers');

  const fetchData = async (league, category) => {
    try {
      const apiKey = '96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332';
      const apiUrl = 'https://api-football-v1.p.rapidapi.com/v3/players/topscorers';
      const apiAssistUrl = 'https://api-football-v1.p.rapidapi.com/v3/players/topassists';

      const response = await axios.get(
        category === 'topScorers' ? apiUrl : apiAssistUrl,
        {
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
          },
          params: {
            league: getLeagueCode(league),
            season: '2023',
          },
        }
      );

      const data = response.data;

      if (data && data.response && data.response.length > 0) {
        setLeagueData((prevData) => ({
          ...prevData,
          [league]: data.response,
        }));
      } else {
        console.log('데이터를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('API 요청 중 오류 발생:', error);
    }
  };

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

  const updateTableHeader = (league) => {
    setCurrentLeague(league);
  };

  const toggleCategory = () => {
    setCurrentCategory((prevCategory) =>
      prevCategory === 'topScorers' ? 'topAssistants' : 'topScorers'
    );
  };

  useEffect(() => {
    fetchData('epl', currentCategory);
  }, [currentCategory]);

  return (
    <div>
      <h1>리그 등점 테이블</h1>
      <div>
        <button id="eplButton" onClick={() => fetchData('epl', currentCategory)}>
          EPL
        </button>
        <button id="laligaButton" onClick={() => fetchData('laliga', currentCategory)}>
          La Liga
        </button>
        <button id="bundesligaButton" onClick={() => fetchData('bundesliga', currentCategory)}>
          Bundesliga
        </button>
        <button id="serieaButton" onClick={() => fetchData('seriea', currentCategory)}>
          Serie A
        </button>
        <button id="ligue1Button" onClick={() => fetchData('ligue1', currentCategory)}>
          Ligue 1
        </button>
      </div>
      <div>
        <button onClick={toggleCategory}>
          {currentCategory === 'topScorers' ? '어시스트 순위' : '득점 순위'}
        </button>
      </div>
      {currentCategory === 'topScorers' ? (
        <TopScorersTable leagueData={leagueData} currentLeague={currentLeague} />
      ) : (
        <TopAssistantsTable leagueData={leagueData} currentLeague={currentLeague} />
      )}
    </div>
  );
};

export default TopPerformers;
