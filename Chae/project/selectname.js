const leagueSelect = document.getElementById("league");
const teamSelect = document.getElementById("team");
const getTeamButton = document.getElementById("getTeamButton");

leagueSelect.addEventListener("change", function () {
    console.log(this.id);
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
/*getTeamButton.addEventListener("click", function () {
    const selectedTeam = teamSelect.value;
    if (selectedTeam !== "") {
        alert("선택된 팀은 " + selectedTeam + "입니다.");
    } else {
        alert("팀을 선택해주세요.");
    }
    getTeamName = selectedTeam;
});*/