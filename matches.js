// Données des matchs tendances avec probabilités
const trendingMatches = [
  {
    id: 1,
    home: "PSG",
    away: "Marseille",
    date: "2025-11-10 20:45",
    probabilities: {
      home: 65,
      draw: 20,
      away: 15
    },
    league: "Ligue 1",
    status: "à venir"
  },
  {
    id: 2,
    home: "Real Madrid",
    away: "Barcelona",
    date: "2025-11-15 21:00",
    probabilities: {
      home: 45,
      draw: 25,
      away: 30
    },
    league: "La Liga",
    status: "à venir"
  },
  {
    id: 3,
    home: "Manchester City",
    away: "Liverpool",
    date: "2025-11-12 18:30",
    probabilities: {
      home: 50,
      draw: 25,
      away: 25
    },
    league: "Premier League",
    status: "à venir"
  },
  {
    id: 4,
    home: "Bayern Munich",
    away: "Dortmund",
    date: "2025-11-14 20:30",
    probabilities: {
      home: 60,
      draw: 25,
      away: 15
    },
    league: "Bundesliga",
    status: "à venir"
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const matchesContainer = document.getElementById('trendingMatches');
  if(!matchesContainer) return;

  trendingMatches.forEach(match => {
    const matchCard = document.createElement('div');
    matchCard.className = 'match-card';
    
    const dateObj = new Date(match.date);
    const formattedDate = new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);

    matchCard.innerHTML = `
      <div class="match-header">
        <span class="league">${match.league}</span>
        <span class="date">${formattedDate}</span>
      </div>
      <div class="teams">
        <div class="team home">
          <span class="team-name">${match.home}</span>
          <div class="probability">
            <div class="prob-bar" style="width: ${match.probabilities.home}%"></div>
            <span class="prob-text">${match.probabilities.home}%</span>
          </div>
        </div>
        <div class="draw">
          <span class="draw-label">Nul</span>
          <div class="probability">
            <div class="prob-bar" style="width: ${match.probabilities.draw}%"></div>
            <span class="prob-text">${match.probabilities.draw}%</span>
          </div>
        </div>
        <div class="team away">
          <span class="team-name">${match.away}</span>
          <div class="probability">
            <div class="prob-bar" style="width: ${match.probabilities.away}%"></div>
            <span class="prob-text">${match.probabilities.away}%</span>
          </div>
        </div>
      </div>
      <div class="match-footer">
        <span class="status">${match.status}</span>
      </div>
    `;
    
    matchesContainer.appendChild(matchCard);
  });
});