const leagueSelect = document.getElementById("league");
const teamSelect = document.getElementById("team");
const getTeamButton = document.getElementById("getTeamButton");

leagueSelect.addEventListener("change", function () {
  // 선택된 리그에 따라 팀 목록을 변경합니다.
  switch (leagueSelect.value) {
    case "epl":
      setTeams([
        "Manchester United",
        "Newcastle",
        "Bournemouth",
        "Fulham",
        "Wolves",
        "Liverpool",
        "Southampton",
        "Arsenal",
        "Everton",
        "Leicester",
        "Tottenham",
        "West Ham",
        "Chelsea",
        "Manchester City",
        "Brighton",
        "Crystal Palace",
        "Brentford",
        "Leeds",
        "Nottingham Forest",
        "Aston Villa",
      ]);
      break;
    case "laliga":
      setTeams([
        "Barcelona",
        "Atletico Madrid",
        "Athletic Club",
        "Valencia",
        "Villarreal",
        "Sevilla",
        "Celta Vigo",
        "Espanyol",
        "Real Madrid",
        "Real Betis",
        "Getafe",
        "Getafe",
        "Girona",
        "Real Sociedad",
        "Valladolid",
        "Almeria",
        "Cadiz",
        "Osasuna",
        "Rayo Vallecano",
        "Elche",
        "Mallorca",
      ]);
      break;
    case "seriea":
      setTeams([
        "Lazio",
        "Sassuolo",
        "AC Milan",
        "Napoli",
        "Udinese",
        "Juventus",
        "AS Roma",
        "Sampdoria",
        "Atalanta",
        "Bologna",
        "Fiorentina",
        "Torino",
        "Verona",
        "Inter",
        "Empoli",
        "Salernitana",
        "Spezia",
        "Cremonese",
        "Lecce",
        "Monza",
      ]);
      break;
    case "bundesliga":
      setTeams([
        "Bayern Munich",
        "Hertha Berlin",
        "SC Freiburg",
        "VfL Wolfsburg",
        "Werder Bremen",
        "Borussia Monchengladbach",
        "FSV Mainz 05",
        "Borussia Dortmund",
        "1899 Hoffenheim",
        "Bayer Leverkusen",
        "Eintracht Frankfurt",
        "FC Augsburg",
        "VfB Stuttgart",
        "RB Leipzig",
        "FC Schalke 04",
        "VfL BOCHUM",
        "Union Berlin",
        "FC Koln",        
      ]);
      break;
    case "ligue1":
      setTeams([
        "Angers",
        "Lille",
        "Lyon",
        "Marseille",
        "Montpellier",
        "Nantes",
        "Nice",
        "Paris Saint Germain",
        "Monaco",
        "Reims",
        "Rennes",
        "Strasbourg",
        "Toulouse",
        "Lorient",
        "Ajaccio",
        "Clermont Foot",
        "Stade Brestois 29",
        "Auxerre",
        "Estac Troyes",
        "Lens",
      ]);
      break;
    default:
      setTeams([]);
  }
});

function setTeams(teams) {
  // 이전에 선택된 팀을 초기화합니다.
  teamSelect.innerHTML = "<option value=''>선택하세요</option>";

  // 팀 목록을 설정합니다.
  teams.forEach(function (team) {
    const option = document.createElement("option");
    option.value = team;
    option.text = team;
    teamSelect.add(option);
  });
}
getTeamButton.addEventListener("click", function () {
  const selectedTeam = teamSelect.value;
  if (selectedTeam !== "") {
    alert("선택된 팀은 " + selectedTeam + "입니다.");

    // REST API를 호출합니다.
    fetch(`http://localhost:3000/teams/${selectedTeam}`)
      .then(response => response.json())
      .then(data => {
        const stats = data.stats;
        console.log(stats);

        const groupedStats = {};

        stats.forEach(item => {
          const fixtureId = item.fixtureId;
          const teamName = item.teamName;
          const statistics = item.statistics;

          if (!groupedStats[fixtureId]) {
            groupedStats[fixtureId] = [];
          }

          groupedStats[fixtureId].push({ teamName, statistics });
        });

        console.log(groupedStats);

        const tableContainer = document.getElementById('table-container');
        tableContainer.innerHTML = '';

        // groupedStats에 있는 fixtureId 별로 테이블 생성
        Object.entries(groupedStats).forEach(([fixtureId, fixtureData]) => {
          const table = document.createElement('table');
          table.id = `table-${fixtureId}`;
          table.className = 'fixture-table'; // 테이블에 클래스 추가
          tableContainer.appendChild(table);

          const caption = document.createElement('caption');
          caption.textContent = `Fixture ID ${fixtureId} Statistics`; // 테이블 라벨
          table.appendChild(caption);

          const thead = document.createElement('thead');
          const headerRow = document.createElement('tr');
          const teamNameHeader = document.createElement('th');
          teamNameHeader.textContent = 'Team Name';
          headerRow.appendChild(teamNameHeader);

          const valueHeaders = Object.keys(fixtureData[0].statistics).map(key => {
            const th = document.createElement('th');
            th.textContent = key;
            return th;
          });

          headerRow.append(...valueHeaders);
          thead.appendChild(headerRow);
          table.appendChild(thead);

          const tbody = document.createElement('tbody');
          fixtureData.forEach((data, index) => {
            const row = document.createElement('tr');
            const teamNameCell = document.createElement('td');
            teamNameCell.textContent = data.teamName;
            row.appendChild(teamNameCell);

            const valueCells = Object.values(data.statistics).map(value => {
              const td = document.createElement('td');
              td.textContent = value;
              return td;
            });

            row.append(...valueCells);
            tbody.appendChild(row);

            // 각 항목별로 구분선 추가
            if (index % 2 === 0) {
              row.classList.add('even-row'); // 짝수 행에 스타일 클래스 추가
            } else {
              row.classList.add('odd-row'); // 홀수 행에 스타일 클래스 추가
            }
          });

          table.appendChild(tbody);
        });
      })
      .catch(error => console.error(error));
  } else {
    alert("팀을 선택해주세요.");
  }
});
