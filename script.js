const TBA_API_KEY = 'unUs8njmymN9rrSQ1f27THOCjQEyqkCV3Jt4z3r6bcuQfuvnCltB99KhsuiWTaHW';
const TEAM_NUMBER = '604'; // Example team number (The Cheesy Poofs)
const EVENT_KEY = '2025camb'; // Example event key (replace with your event)

// DOM Elements
const teamNumberElement = document.getElementById('team-number');
const teamRankElement = document.getElementById('team-rank');
const nextMatchTimeElement = document.getElementById('next-match-time');
const matchTableBody = document.querySelector('#match-table tbody');

// Fetch data from TBA API
async function fetchData(url) {
  try {
    const response = await fetch(url, {
      headers: { 'X-TBA-Auth-Key': TBA_API_KEY }
    });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

// Set team number
function setTeamNumber() {
  teamNumberElement.textContent = TEAM_NUMBER;
}

// Get team rank
async function getTeamRank() {
  const url = `https://www.thebluealliance.com/api/v3/team/frc${TEAM_NUMBER}/event/${EVENT_KEY}/status`;
  const data = await fetchData(url);
  teamRankElement.textContent = data?.qual?.ranking?.rank || 'N/A';
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

// Get match list and display in table
async function getMatchList() {
    const url = `https://www.thebluealliance.com/api/v3/team/frc${TEAM_NUMBER}/event/${EVENT_KEY}/matches`;
    const matches = await fetchData(url);
  
    // Filter matches to only include those involving the specified team
    const teamMatches = matches.filter(match =>
      match.alliances.red.team_keys.includes(`frc${TEAM_NUMBER}`) ||
      match.alliances.blue.team_keys.includes(`frc${TEAM_NUMBER}`)
    );
  
    // Sort matches by time
    teamMatches.sort((a, b) => a.time - b.time);
  
    // Clear existing table rows
    matchTableBody.innerHTML = '';
  
    // Track playoff match numbers
    let playoffMatchCounter = 1;
  
    // Add rows for each match
    teamMatches.forEach(match => {
      const row = document.createElement('tr');
  
      // Match number
      const matchNumberCell = document.createElement('td');
      let matchLabel = '';
  
      if (match.comp_level === 'qm') {
        // Qualifying matches
        matchLabel = `Q${match.match_number}`;
      } else if (match.comp_level === 'sf') {
        // Semifinal matches
        matchLabel = `P${playoffMatchCounter}`;
        playoffMatchCounter++; // Increment the counter for each playoff match
      } else if (match.comp_level === 'f') {
        // Final matches
        matchLabel = `F${match.match_number}`;
      }
      matchNumberCell.textContent = matchLabel;
      row.appendChild(matchNumberCell);
  
      // Match time
      const matchTimeCell = document.createElement('td');
      const matchTime = new Date(match.time * 1000);
      const options = { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' };
      matchTimeCell.textContent = matchTime.toLocaleString('en-US', options);
      row.appendChild(matchTimeCell);
  
      // Alliances (Red on top, Blue below)
      const alliancesCell = document.createElement('td');
      const redAlliance = match.alliances.red.team_keys.map(team => team.replace('frc', '')).join(', ');
      const blueAlliance = match.alliances.blue.team_keys.map(team => team.replace('frc', '')).join(', ');
      alliancesCell.innerHTML = `<strong>Red:</strong> ${redAlliance}<br><strong>Blue:</strong> ${blueAlliance}`;
      row.appendChild(alliancesCell);
  
      // Result (Win, Loss, or Tie)
      const resultCell = document.createElement('td');
      if (match.actual_time) {
        const teamAlliance = match.alliances.blue.team_keys.includes(`frc${TEAM_NUMBER}`) ? 'blue' : 'red';
        const winningAlliance = match.winning_alliance;
  
        if (winningAlliance === teamAlliance) {
          resultCell.textContent = 'Win';
        } else if (winningAlliance === '') {
          resultCell.textContent = 'Tie';
        } else {
          resultCell.textContent = 'Loss';
        }
      } else {
        resultCell.textContent = 'Not played';
      }
      row.appendChild(resultCell);
  
      // Ranking points (from TBA score_breakdown)
      const rankingPointsCell = document.createElement('td');
      if (match.actual_time && match.score_breakdown) {
        const teamAlliance = match.alliances.blue.team_keys.includes(`frc${TEAM_NUMBER}`) ? 'blue' : 'red';
        const rankingPoints = match.score_breakdown[teamAlliance]?.rp || 0;
        rankingPointsCell.textContent = rankingPoints;
      } else {
        rankingPointsCell.textContent = '-';
      }
      row.appendChild(rankingPointsCell);
  
      // Add row to table
      matchTableBody.appendChild(row);
    });
}

// Initialize dashboard
async function initDashboard() {
  setTeamNumber();
  await getTeamRank();
  await getNextMatch();
  await getMatchList();
}

initDashboard();