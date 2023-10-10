const axios = require('axios');

const apiKey = '96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332';
const apiUrl = 'https://api-football-v1.p.rapidapi.com/v3/players/topscorers';

const config = {
  headers: {
    'X-RapidAPI-Key': apiKey,
    'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
  },
  params: {
    league: '39',
    season: '2023',
  },
};

axios
  .get(apiUrl, config)
  .then((response) => {
    const data = response.data;

    if (data && data.response && data.response.length > 0) {
      const topScorers = data.response;
      topScorers.forEach((scorer) => {
        const playerName = scorer.player.name;
        const teamName = scorer.statistics[0].team.name;
        const goals = scorer.statistics[0].goals.total;

        console.log(`선수 이름: ${playerName}, 팀 이름: ${teamName}, 골 수: ${goals}`);
      });
    } else {
      console.log('데이터를 찾을 수 없습니다.');
    }
  })
  .catch((error) => {
    console.error('API 요청 중 오류 발생:', error);
  });
