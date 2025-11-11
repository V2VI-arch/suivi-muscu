// Données des matchs avec équipes et ligues variées
const allMatches = [
  // Ligue 1
  { home: "PSG", away: "Marseille", league: "Ligue 1", daysOffset: 0.5, home: 65, draw: 20, away: 15 },
  { home: "Lyon", away: "AS Monaco", league: "Ligue 1", daysOffset: 1.2, home: 55, draw: 25, away: 20 },
  { home: "Lens", away: "Nice", league: "Ligue 1", daysOffset: 1.5, home: 48, draw: 28, away: 24 },
  { home: "Saint-Étienne", away: "Lille", league: "Ligue 1", daysOffset: 2, home: 35, draw: 30, away: 35 },
  { home: "Rennes", away: "Bordeaux", league: "Ligue 1", daysOffset: 2.3, home: 62, draw: 22, away: 16 },
  
  // La Liga
  { home: "Real Madrid", away: "Barcelona", league: "La Liga", daysOffset: 1.8, home: 45, draw: 25, away: 30 },
  { home: "Atletico Madrid", away: "Sevilla", league: "La Liga", daysOffset: 0.7, home: 58, draw: 24, away: 18 },
  { home: "Valencia", away: "Real Sociedad", league: "La Liga", daysOffset: 1.1, home: 50, draw: 26, away: 24 },
  { home: "Getafe", away: "Villarreal", league: "La Liga", daysOffset: 2.5, home: 40, draw: 32, away: 28 },
  
  // Premier League
  { home: "Manchester City", away: "Liverpool", league: "Premier League", daysOffset: 2.1, home: 50, draw: 25, away: 25 },
  { home: "Arsenal", away: "Manchester United", league: "Premier League", daysOffset: 1.4, home: 52, draw: 24, away: 24 },
  { home: "Chelsea", away: "Tottenham", league: "Premier League", daysOffset: 0.8, home: 48, draw: 27, away: 25 },
  { home: "Newcastle", away: "Brighton", league: "Premier League", daysOffset: 2.2, home: 55, draw: 23, away: 22 },
  
  // Bundesliga
  { home: "Bayern Munich", away: "Dortmund", league: "Bundesliga", daysOffset: 1.9, home: 60, draw: 25, away: 15 },
  { home: "Leverkusen", away: "Stuttgart", league: "Bundesliga", daysOffset: 0.6, home: 55, draw: 26, away: 19 },
  { home: "RB Leipzig", away: "Union Berlin", league: "Bundesliga", daysOffset: 1.3, home: 58, draw: 22, away: 20 },
  { home: "Hoffenheim", away: "Mainz", league: "Bundesliga", daysOffset: 2.4, home: 52, draw: 28, away: 20 },
  
  // Serie A
  { home: "Juventus", away: "AC Milan", league: "Serie A", daysOffset: 1.6, home: 48, draw: 28, away: 24 },
  { home: "Inter Milan", away: "Roma", league: "Serie A", daysOffset: 2, home: 62, draw: 20, away: 18 },
  { home: "Napoli", away: "Lazio", league: "Serie A", daysOffset: 0.9, home: 55, draw: 25, away: 20 },
  { home: "Fiorentina", away: "Atalanta", league: "Serie A", daysOffset: 1.7, home: 50, draw: 27, away: 23 }
];

// Générer les matchs tendances (4 matchs futurs)
function generateTrendingMatches() {
  const now = new Date();
  const shuffled = allMatches.sort(() => Math.random() - 0.5);
  
  return shuffled.slice(0, 4).map((match, i) => {
    const matchDate = new Date(now.getTime() + (match.daysOffset || (i + 0.5)) * 24 * 60 * 60 * 1000);
    matchDate.setHours(20 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
    
    return {
      id: i + 1,
      home: match.home,
      away: match.away,
      league: match.league,
      date: matchDate.toISOString(),
      probabilities: {
        home: match.home,
        draw: match.draw,
        away: match.away
      },
      status: "à venir"
    };
  });
}

let trendingMatches = generateTrendingMatches();

document.addEventListener('DOMContentLoaded', () => {
  const matchesContainer = document.getElementById('trendingMatches');
  if(!matchesContainer) return;

  function renderMatches() {
    const now = new Date();
    matchesContainer.innerHTML = '';

    // Filtrer les matchs à venir (ignorant ceux qui sont terminés)
    const upcomingMatches = trendingMatches.filter(match => {
      const matchTime = new Date(match.date);
      return matchTime > now;
    });

    // Si aucun match à venir, générer de nouveaux matchs
    if (upcomingMatches.length === 0) {
      trendingMatches = generateTrendingMatches();
      renderMatches();
      return;
    }

    // Afficher les matchs à venir
    upcomingMatches.forEach(match => {
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
  }

  // Affichage initial
  renderMatches();

  // Vérifier toutes les 5 minutes si des matchs sont terminés
  setInterval(renderMatches, 5 * 60 * 1000);
});