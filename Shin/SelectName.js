const leagueSelect = document.getElementById("league");
const teamSelect = document.getElementById("team");
const getTeamButton = document.getElementById("getTeamButton");

leagueSelect.addEventListener("change", function () {
  // 선택된 리그에 따라 팀 목록을 변경합니다.
  switch (leagueSelect.value) {
    case "epl":
      setTeams([
        "맨체스터 유나이티드",
        "첼시",
        "리버풀",
        // 나머지 프리미어 리그 팀들을 추가합니다.
      ]);
      break;
    case "laliga":
      setTeams([
        "레알 마드리드",
        "바르셀로나",
        "아틀레티코 마드리드",
        // 나머지 라 리가 팀들을 추가합니다.
      ]);
      break;
    case "seriea":
      setTeams([
        "유벤투스",
        "인터 밀란",
        "AC 밀란",
        // 나머지 세리에 A 팀들을 추가합니다.
      ]);
      break;
    case "bundesliga":
      setTeams([
        "바이에른 뮌헨",
        "도르트문트",
        "라이프치히",
        // 나머지 분데스리가 팀들을 추가합니다.
      ]);
      break;
    case "ligue1":
      setTeams([
        "파리 생제르망",
        "리옹",
        "마르세유",
        // 나머지 리그 1 팀들을 추가합니다.
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
    } else {
      alert("팀을 선택해주세요.");
    }
  });
