const TBA_API_KEY = 'unUs8njmymN9rrSQ1f27THOCjQEyqkCV3Jt4z3r6bcuQfuvnCltB99KhsuiWTaHW	';
const TEAM_NUMBER = '604'; // Example team number (The Cheesy Poofs)
const EVENT_KEY = '2025camb'; // Example event key (replace with your event)

// DOM Elements
const teamRankElement = document.getElementById('team-rank');
const nextMatchTimeElement = document.getElementById('next-match-time');
const matchListElement = document.getElementById('match-list');

// Fetch data from TBA API
async function fetchData(url) {
  const response = await fetch(url, {
    headers: { 'X-TBA-Auth-Key': TBA_API_KEY }
  });
  return await response.json();
}

// Get team rank
async function getTeamRank() {
  const url = `https://www.thebluealliance.com/api/v3/team/frc${TEAM_NUMBER}/event/${EVENT_KEY}/status`;
  const data = await fetchData(url);
  teamRankElement.textContent = data.qual?.ranking?.rank || 'N/A';
}

// Get next match and time left
async function getNextMatch() {
  const url = `https://www.thebluealliance.com/api/v3/team/frc${TEAM_NUMBER}/event/${EVENT_KEY}/matches`;
  const matches = await fetchData(url);
  const upcomingMatches = matches.filter(match => match.actual_time === null).sort((a, b) => a.time - b.time);

  if (upcomingMatches.length > 0) {
    const nextMatch = upcomingMatches[0];
    const matchTime = new Date(nextMatch.time * 1000);
    const timeLeft = Math.max(0, matchTime - Date.now());

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    nextMatchTimeElement.textContent = `${hours}h ${minutes}m`;
  } else {
    nextMatchTimeElement.textContent = 'No upcoming matches';
  }
}

// Get match list
async function getMatchList() {
  const url = `https://www.thebluealliance.com/api/v3/team/frc${TEAM_NUMBER}/event/${EVENT_KEY}/matches`;
  const matches = await fetchData(url);
  const upcomingMatches = matches.filter(match => match.actual_time === null).sort((a, b) => a.time - b.time);

  matchListElement.innerHTML = upcomingMatches.map(match => `
    <li>
      Match ${match.match_number} - ${new Date(match.time * 1000).toLocaleString()}
    </li>
  `).join('');
}

// Initialize dashboard
async function initDashboard() {
  await getTeamRank();
  await getNextMatch();
  await getMatchList();
}

initDashboard();