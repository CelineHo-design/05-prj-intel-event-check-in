const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const greeting = document.getElementById("greeting");
const celebration = document.getElementById("celebration");
const attendeeList = document.getElementById("attendeeList");

const maxCount = 50;
const storageKey = "intel-summit-checkin-data";
const teamLabels = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables",
};

let state = {
  count: 0,
  teamCounts: {
    water: 0,
    zero: 0,
    power: 0,
  },
  attendees: [],
};

function loadState() {
  const savedData = localStorage.getItem(storageKey);

  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);

      if (parsedData && parsedData.count !== undefined) {
        state = parsedData;
      }
    } catch (error) {
      console.log("Unable to read saved data");
    }
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function updateTeamCard(teamKey) {
  const teamCounter = document.getElementById(teamKey + "Count");
  teamCounter.textContent = state.teamCounts[teamKey];
}

function updateProgress() {
  const percentage = Math.min(Math.round((state.count / maxCount) * 100), 100);

  attendeeCount.textContent = state.count;
  progressBar.style.width = percentage + "%";
  progressText.textContent = `${state.count} of ${maxCount} attendees (${percentage}%)`;
}

function updateAttendeeList() {
  attendeeList.innerHTML = "";

  if (state.attendees.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "attendee-empty";
    emptyItem.textContent = "No attendees checked in yet.";
    attendeeList.appendChild(emptyItem);
    return;
  }

  state.attendees.forEach(function (attendee) {
    const listItem = document.createElement("li");
    listItem.className = "attendee-item";
    listItem.innerHTML =
      '<span class="attendee-name">' +
      attendee.name +
      "</span>" +
      '<span class="attendee-team">' +
      teamLabels[attendee.team] +
      "</span>";
    attendeeList.appendChild(listItem);
  });
}

function getWinningTeam() {
  let winningTeam = "water";

  if (
    state.teamCounts.zero > state.teamCounts[winningTeam] &&
    state.teamCounts.zero >= state.teamCounts.power
  ) {
    winningTeam = "zero";
  } else if (state.teamCounts.power > state.teamCounts[winningTeam]) {
    winningTeam = "power";
  }

  return winningTeam;
}

function updateCelebration() {
  if (state.count >= maxCount) {
    const winningTeam = getWinningTeam();
    const winningTeamName = teamLabels[winningTeam];
    const winningCount = state.teamCounts[winningTeam];

    celebration.innerHTML =
      "🎉 Goal reached! <strong>" +
      winningTeamName +
      "</strong> is leading with " +
      winningCount +
      " check-ins.";
    celebration.classList.add("show");
  } else {
    celebration.classList.remove("show");
  }
}

function render() {
  updateProgress();
  updateTeamCard("water");
  updateTeamCard("zero");
  updateTeamCard("power");
  updateAttendeeList();
  updateCelebration();
}

function showGreeting(name, teamName) {
  greeting.textContent = `Welcome, ${name} from ${teamName}!`;
  greeting.className = "success-message";
  greeting.style.display = "block";
}

loadState();
render();

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const trimmedName = nameInput.value.trim();
  const selectedTeam = teamSelect.value;

  if (!trimmedName || !selectedTeam) {
    return;
  }

  const teamName = teamSelect.selectedOptions[0].text;

  state.count++;
  state.teamCounts[selectedTeam]++;
  state.attendees.push({
    name: trimmedName,
    team: selectedTeam,
  });

  saveState();
  render();
  showGreeting(trimmedName, teamName);

  form.reset();
  nameInput.focus();
});
