import React, { useState, useEffect } from 'react';
import './team.css';

const Team = () => {
    const [league, setLeague] = useState('');
    const [team, setTeam] = useState('');
    const [teams, setTeams] = useState([]);
    const [groupedStats, setGroupedStats] = useState({});

    useEffect(() => {
        // Fetch teams data based on selected league
        const fetchTeams = async () => {
            let teamData;
            switch (league) {
                case 'epl':
                    teamData = [
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
                    ];
                    break;
                case 'laliga':
                    teamData = [
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
                    ];
                    break;
                case 'seriea':
                    teamData = [
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
                    ];
                    break;
                case 'bundesliga':
                    teamData = [
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
                    ];
                    break;
                case 'ligue1':
                    teamData = [
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
                    ];
                    break;
                default:
                    teamData = [];
            }
            setTeams(teamData);
        };

        fetchTeams();
    }, [league]);

    const handleTeamSelect = (event) => {
        setTeam(event.target.value);
    };

    const handleGetTeamStats = async () => {
        if (team !== "") {
            alert("선택된 팀은 " + team + "입니다.");

            try {
                const response = await fetch(`http://localhost:5000/teams/${team}`);
                const data = await response.json();
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
                setGroupedStats(groupedStats);
            } catch (error) {
                console.error(error);
            }
        } else {
            alert("팀을 선택해주세요.");
        }
    };

    return (
        <div>
            <label htmlFor="league">리그 선택:</label>
            <select id="league" value={league} onChange={(event) => setLeague(event.target.value)}>
                <option value="">리그를 선택하세요</option>
                <option value="epl">EPL</option>
                <option value="laliga">La Liga</option>
                <option value="seriea">Serie A</option>
                <option value="bundesliga">Bundesliga</option>
                <option value="ligue1">Ligue1</option>
            </select>
            <br />
            <label htmlFor="team">팀 선택:</label>
            <select id="team" value={team} onChange={(event) => setTeam(event.target.value)}>
                <option value="">팀을 선택하세요</option>
                {teams.map((team, index) => (
                    <option key={index} value={team}>{team}</option>
                ))}
            </select>
            <br />
            <button id="getTeamButton" onClick={handleGetTeamStats}>팀 통계 가져오기</button>

            <div id="table-container">
                {Object.entries(groupedStats).map(([fixtureId, fixtureData]) => (
                    <div key={fixtureId} className="fixture-table-container">
                        <table id={`table-${fixtureId}`} className="fixture-table horizontal">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    {fixtureData.map(data => (
                                        <th key={data.teamName}>{data.teamName}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(fixtureData[0].statistics).map(([type, _]) => (
                                    <tr key={type}>
                                        <td>{type}</td>
                                        {fixtureData.map(data => (
                                            <td key={data.teamName}>{data.statistics[type]}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Team;