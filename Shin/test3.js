getTeamButton.addEventListener("click", function () {
	const selectedTeam = teamSelect.value;
	if (selectedTeam !== "") {
	  alert("선택된 팀은 " + selectedTeam + "입니다.");
  
	  // REST API를 호출합니다.
	  fetch(`http://localhost:3000/teams/${selectedTeam}`)
		.then(response => response.json())
		.then(data => {
		  const stats = data.stats;
  
		  // stats를 HTML에 출력
		  const statsList = document.getElementById("statsList");
		  statsList.innerHTML = ""; // 기존 내용을 초기화
  
		  if (stats.length === 0) {
			const listItem = document.createElement("li");
			listItem.textContent = "통계 정보가 없습니다.";
			statsList.appendChild(listItem);
		  } else {
			stats.forEach(stat => {
			  if (stat.hasOwnProperty("teamName") && stat.hasOwnProperty("statistics")) {
				const teamName = stat.teamName;
				const statistics = stat.statistics;
  
				const listItem = document.createElement("li");
				listItem.innerHTML = `
				  <b>Team Name:</b> ${JSON.stringify(teamName)}<br>
				  <b>Statistics:</b> ${JSON.stringify(statistics)}<br><br>
				`;
				statsList.appendChild(listItem);
			  } else {
				const listItem = document.createElement("li");
				listItem.textContent = "잘못된 데이터입니다.";
				statsList.appendChild(listItem);
			  }
			});
		  }
  
		  // 콘솔 출력
		  console.dir(stats);
		})
		.catch(error => console.error(error));
	} else {
	  alert("팀을 선택해주세요.");
	}
  });