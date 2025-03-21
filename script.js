const TBA_API_KEY = "unUs8njmymN9rrSQ1f27THOCjQEyqkCV3Jt4z3r6bcuQfuvnCltB99KhsuiWTaHW";
const EVENT_KEY = "camb";  // Example: "2024casj"
const TEAM_NUMBER = "604";  // Example: 254

// Fetch data from TBA API
async function fetchTBAData(endpoint) {
    const response = await fetch(`https://www.thebluealliance.com/api/v3${endpoint}`, {
        headers: { "X-TBA-Auth-Key": TBA_API_KEY }
    });
    return response.json();
}

// Load rankings
async function loadRanking() {
    const data = await fetchTBAData(`/event/${EVENT_KEY}/rankings`);
    const rankingData = data.rankings.find(r => r.team_key === `frc${TEAM_NUMBER}`);
    
    if (rankingData) {
        document.getElementById("ranking").textContent = 
            `Rank: ${rankingData.rank} | W: ${rankingData.record.wins}, L: ${rankingData.record.losses}, T: ${rankingData.record.ties}`;
    } else {
        document.getElementById("ranking").textContent = "No ranking data available";
    }
}

// Load upcoming matches
async function loadMatches() {
    const matches = await fetchTBAData(`/team/frc${TEAM_NUMBER}/event/${EVENT_KEY}/matches`);
    const upcomingMatches = matches.filter(m => m.predicted_time && m.actual_time === null);

    const matchList = document.getElementById("matches");
    matchList.innerHTML = "";
    
    upcomingMatches.slice(0, 5).forEach(match => {
        const time = new Date(match.predicted_time * 1000).toLocaleTimeString();
        const matchItem = document.createElement("li");
        matchItem.textContent = `Match ${match.match_number} - ${time}`;
        matchList.appendChild(matchItem);
    });
}

// Check current match and update the timer
async function updateMatchTimer() {
    const matches = await fetchTBAData(`/team/frc${TEAM_NUMBER}/event/${EVENT_KEY}/matches`);
    const ongoingMatch = matches.find(m => m.actual_time && !m.post_result_time);
    
    if (ongoingMatch) {
        const startTime = new Date(ongoingMatch.actual_time * 1000);
        const elapsedTime = (Date.now() - startTime.getTime()) / 1000;
        const matchDuration = 150; // Typical FRC match length (150 seconds)

        if (elapsedTime < matchDuration) {
            const remainingTime = Math.max(0, matchDuration - elapsedTime);
            document.getElementById("match-timer").textContent = `${Math.floor(remainingTime)}s remaining`;
        } else {
            document.getElementById("match-timer").textContent = "Match over";
        }
    } else {
        document.getElementById("match-timer").textContent = "No active match";
    }
}

// Auto-refresh data every 5 seconds
function startDashboard() {
    loadRanking();
    loadMatches();
    updateMatchTimer();
    setInterval(() => {
        loadRanking();
        loadMatches();
        updateMatchTimer();
    }, 5000);
}

document.addEventListener("DOMContentLoaded", startDashboard);
