// Gestionnaire des statistiques
const trainingManager = new TrainingManager();

// Créer une instance AccountManager pour vérifier le compte
class AccountManager {
  constructor() {
    this.storageKey = 'userAccount';
    this.loadAccount();
  }

  loadAccount() {
    const data = localStorage.getItem(this.storageKey);
    this.account = data ? JSON.parse(data) : null;
  }

  getAccount() {
    return this.account;
  }

  hasAccount() {
    return this.account !== null;
  }
}

const accountManager = new AccountManager();

document.addEventListener('DOMContentLoaded', () => {
  // Vérifier si l'utilisateur a un compte
  if (!accountManager.hasAccount()) {
    showAccountRequiredMessage();
  } else {
    initializeDateFilters();
    loadStats();
    setupEventListeners();
  }
});

function showAccountRequiredMessage() {
  const container = document.querySelector('main .container');
  if (container) {
    const message = document.createElement('div');
    message.className = 'card alert-card';
    message.innerHTML = `
      <h2>⚠️ Compte requis</h2>
      <p>Vous devez d'abord créer un compte pour voir vos statistiques.</p>
      <a href="account.html" class="btn primary">Créer mon compte</a>
    `;
    
    const mainContent = container.querySelector('h1');
    if (mainContent) {
      mainContent.after(message);
    }
  }
}

function initializeDateFilters() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  document.getElementById('endDate').value = today.toISOString().split('T')[0];
  document.getElementById('startDate').value = thirtyDaysAgo.toISOString().split('T')[0];
}

function setupEventListeners() {
  document.getElementById('applyFilters').addEventListener('click', loadStats);
  document.getElementById('resetFilters').addEventListener('click', () => {
    initializeDateFilters();
    loadStats();
  });

  document.getElementById('exerciseSelect').addEventListener('change', updateExerciseProgress);
  document.getElementById('exportBtn').addEventListener('click', exportCSV);
  document.getElementById('exportJsonBtn').addEventListener('click', exportJSON);
}

function getFilteredTrainings() {
  const startDate = new Date(document.getElementById('startDate').value);
  const endDate = new Date(document.getElementById('endDate').value);
  
  return trainingManager.getTrainingsByDateRange(startDate, endDate);
}

function loadStats() {
  const filteredTrainings = getFilteredTrainings();
  
  updateMainStats(filteredTrainings);
  updateMuscleGroupStats(filteredTrainings);
  updateExerciseSelect(filteredTrainings);
  updatePeriodComparison();
  updateTopPerformances(filteredTrainings);
}

function updateMainStats(trainings) {
  const stats = trainingManager.getMuscleGroupStats(trainings);
  const totalVolume = trainingManager.getTotalVolume(trainings);
  
  // Obtenir la première et la dernière date pour calculer les jours
  if (trainings.length === 0) {
    document.getElementById('statTotalTrainings').textContent = '0';
    document.getElementById('statTotalDays').textContent = '0';
    document.getElementById('statTotalVolume').textContent = '0';
    document.getElementById('statAvgWeight').textContent = '0kg';
    return;
  }

  const dates = trainings.map(t => new Date(t.date).getTime());
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  const daysRange = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));

  const avgWeight = trainings.reduce((sum, t) => sum + t.weight, 0) / trainings.length;

  document.getElementById('statTotalTrainings').textContent = trainings.length;
  document.getElementById('statTotalDays').textContent = daysRange;
  document.getElementById('statTotalVolume').textContent = totalVolume.toFixed(0);
  document.getElementById('statAvgWeight').textContent = avgWeight.toFixed(1) + 'kg';
  document.getElementById('statTrainingsChange').textContent = `Variation: ${trainings.length} dans cette période`;
  document.getElementById('statVolumeChange').textContent = `Total: ${totalVolume.toFixed(0)}kg soulevés`;
}

function updateMuscleGroupStats(trainings) {
  const container = document.getElementById('muscleGroupStats');
  const stats = trainingManager.getMuscleGroupStats(trainings);
  
  if (Object.keys(stats).length === 0) {
    container.innerHTML = '<p class="text-muted">Aucune donnée disponible.</p>';
    return;
  }

  const sorted = Object.entries(stats).sort((a, b) => b[1].count - a[1].count);

  container.innerHTML = `
    <div class="stats-table">
      <table>
        <thead>
          <tr>
            <th>Groupe musculaire</th>
            <th>Entraînements</th>
            <th>Volume (kg)</th>
            <th>Poids moyen</th>
            <th>Exercices</th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map(([group, s]) => `
            <tr>
              <td><strong>${group}</strong></td>
              <td>${s.count}</td>
              <td>${s.volume.toFixed(0)}</td>
              <td>${s.avgWeight.toFixed(1)}kg</td>
              <td>${s.exercises.length}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function updateExerciseSelect(trainings) {
  const exercises = trainingManager.getAllExercises(trainings);
  const select = document.getElementById('exerciseSelect');
  
  select.innerHTML = '<option value="">Choisir un exercice...</option>' +
    exercises.map(ex => `<option value="${ex}">${ex}</option>`).join('');
}

function updateExerciseProgress() {
  const exercise = document.getElementById('exerciseSelect').value;
  const container = document.getElementById('exerciseProgress');
  
  if (!exercise) {
    container.innerHTML = '<p class="text-muted">Sélectionnez un exercice pour voir sa progression.</p>';
    return;
  }

  const progress = trainingManager.getExerciseProgress(exercise);
  
  if (progress.length === 0) {
    container.innerHTML = '<p class="text-muted">Aucune donnée pour cet exercice.</p>';
    return;
  }

  // Calculer les statistiques de progression
  const firstTraining = progress[0];
  const lastTraining = progress[progress.length - 1];
  const avgWeight = progress.reduce((sum, t) => sum + t.weight, 0) / progress.length;
  const maxWeight = Math.max(...progress.map(t => t.weight));
  const totalVolume = trainingManager.getTotalVolume(progress);

  const progressionPercent = ((lastTraining.weight - firstTraining.weight) / firstTraining.weight * 100).toFixed(1);

  container.innerHTML = `
    <div class="progress-overview">
      <div class="progress-stat">
        <div class="stat-label">Poids initial</div>
        <div class="stat-value">${firstTraining.weight}kg</div>
        <div class="stat-date">${new Date(firstTraining.date).toLocaleDateString('fr-FR')}</div>
      </div>
      <div class="progress-stat">
        <div class="stat-label">Poids actuel</div>
        <div class="stat-value">${lastTraining.weight}kg</div>
        <div class="stat-date">${new Date(lastTraining.date).toLocaleDateString('fr-FR')}</div>
      </div>
      <div class="progress-stat">
        <div class="stat-label">Progression</div>
        <div class="stat-value ${progressionPercent >= 0 ? 'positive' : 'negative'}">${progressionPercent > 0 ? '+' : ''}${progressionPercent}%</div>
        <div class="stat-date">-</div>
      </div>
      <div class="progress-stat">
        <div class="stat-label">Poids max</div>
        <div class="stat-value">${maxWeight}kg</div>
        <div class="stat-date">-</div>
      </div>
    </div>

    <div class="progress-history">
      <h3>Historique de progression</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Poids</th>
            <th>Séries x Reps</th>
            <th>Volume</th>
          </tr>
        </thead>
        <tbody>
          ${progress.map(t => `
            <tr>
              <td>${new Date(t.date).toLocaleDateString('fr-FR')}</td>
              <td>${t.weight}kg</td>
              <td>${t.series}x${t.reps}</td>
              <td>${t.volume}kg</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function updatePeriodComparison() {
  const container = document.getElementById('periodComparison');
  const allTrainings = trainingManager.getAllTrainings();
  
  if (allTrainings.length === 0) {
    container.innerHTML = '<p class="text-muted">Aucune donnée disponible.</p>';
    return;
  }

  // Calculer les stats pour les 4 dernières semaines
  const today = new Date();
  const weeks = [];

  for (let i = 0; i < 4; i++) {
    const weekEnd = new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weekTrainings = allTrainings.filter(t => {
      const date = new Date(t.date);
      return date >= weekStart && date <= weekEnd;
    });

    weeks.push({
      period: `Semaine ${4 - i}`,
      count: weekTrainings.length,
      volume: trainingManager.getTotalVolume(weekTrainings)
    });
  }

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Période</th>
          <th>Entraînements</th>
          <th>Volume (kg)</th>
        </tr>
      </thead>
      <tbody>
        ${weeks.map(w => `
          <tr>
            <td>${w.period}</td>
            <td>${w.count}</td>
            <td>${w.volume.toFixed(0)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function updateTopPerformances(trainings) {
  const container = document.getElementById('topPerformances');
  
  if (trainings.length === 0) {
    container.innerHTML = '<p class="text-muted">Aucune donnée disponible.</p>';
    return;
  }

  // Top 5 par volume
  const topByVolume = [...trainings]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);

  // Top 5 par poids
  const topByWeight = [...trainings]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);

  container.innerHTML = `
    <div class="top-performances">
      <div class="top-section">
        <h3>🏋️ Top 5 Volumes</h3>
        <ol>
          ${topByVolume.map(t => `
            <li>
              <strong>${t.exercise}</strong> - ${t.volume}kg
              <br><small>${t.muscleGroup} • ${new Date(t.date).toLocaleDateString('fr-FR')}</small>
            </li>
          `).join('')}
        </ol>
      </div>

      <div class="top-section">
        <h3>💪 Top 5 Poids</h3>
        <ol>
          ${topByWeight.map(t => `
            <li>
              <strong>${t.exercise}</strong> - ${t.weight}kg
              <br><small>${t.series}x${t.reps} • ${t.muscleGroup}</small>
            </li>
          `).join('')}
        </ol>
      </div>
    </div>
  `;
}

function exportCSV() {
  const trainings = trainingManager.getAllTrainings();
  
  if (trainings.length === 0) {
    alert('Aucune donnée à exporter');
    return;
  }

  let csv = 'Date,Groupe musculaire,Exercice,Séries,Reps,Poids (kg),Volume (kg),Notes\n';
  
  trainings.forEach(t => {
    const notes = t.notes.replace(/,/g, ';').replace(/\n/g, ' ');
    csv += `${t.date},${t.muscleGroup},${t.exercise},${t.series},${t.reps},${t.weight},${t.volume},"${notes}"\n`;
  });

  downloadFile(csv, 'entrainements.csv', 'text/csv');
}

function exportJSON() {
  const trainings = trainingManager.getAllTrainings();
  
  if (trainings.length === 0) {
    alert('Aucune donnée à exporter');
    return;
  }

  const json = JSON.stringify(trainings, null, 2);
  downloadFile(json, 'entrainements.json', 'application/json');
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Classe TrainingManager
class TrainingManager {
  constructor() {
    this.storageKey = 'workoutData';
    this.loadData();
  }

  loadData() {
    const data = localStorage.getItem(this.storageKey);
    this.trainings = data ? JSON.parse(data) : [];
  }

  addTraining(training) {
    const newTraining = {
      id: Date.now(),
      date: training.date,
      muscleGroup: training.muscleGroup,
      exercise: training.exercise,
      series: parseInt(training.series),
      reps: parseInt(training.reps),
      weight: parseFloat(training.weight),
      volume: parseInt(training.series) * parseInt(training.reps) * parseFloat(training.weight),
      notes: training.notes || '',
      createdAt: new Date().toISOString()
    };
    
    this.trainings.unshift(newTraining);
    this.saveData();
    return newTraining;
  }

  deleteTraining(id) {
    this.trainings = this.trainings.filter(t => t.id !== id);
    this.saveData();
  }

  updateTraining(id, updates) {
    const training = this.trainings.find(t => t.id === id);
    if (training) {
      Object.assign(training, updates);
      if (updates.series || updates.reps || updates.weight) {
        training.volume = training.series * training.reps * training.weight;
      }
      this.saveData();
    }
    return training;
  }

  saveData() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.trainings));
  }

  getAllTrainings() {
    return this.trainings;
  }

  getTrainingsByMuscleGroup(muscleGroup) {
    return this.trainings.filter(t => t.muscleGroup === muscleGroup);
  }

  getTrainingsByDateRange(startDate, endDate) {
    return this.trainings.filter(t => {
      const date = new Date(t.date);
      return date >= startDate && date <= endDate;
    });
  }

  getTrainingsThisWeek() {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return this.getTrainingsByDateRange(weekAgo, today);
  }

  getTotalVolume(trainings = this.trainings) {
    return trainings.reduce((sum, t) => sum + t.volume, 0);
  }

  getUniqueMuscleGroups(trainings = this.trainings) {
    return [...new Set(trainings.map(t => t.muscleGroup))];
  }

  getMuscleGroupStats(trainings = this.trainings) {
    const stats = {};
    trainings.forEach(t => {
      if (!stats[t.muscleGroup]) {
        stats[t.muscleGroup] = {
          count: 0,
          volume: 0,
          exercises: new Set(),
          avgWeight: 0,
          totalWeight: 0
        };
      }
      stats[t.muscleGroup].count++;
      stats[t.muscleGroup].volume += t.volume;
      stats[t.muscleGroup].exercises.add(t.exercise);
      stats[t.muscleGroup].totalWeight += t.weight;
    });

    Object.keys(stats).forEach(key => {
      stats[key].exercises = Array.from(stats[key].exercises);
      stats[key].avgWeight = stats[key].totalWeight / stats[key].count;
    });

    return stats;
  }

  getExerciseProgress(exercise) {
    const trainings = this.trainings
      .filter(t => t.exercise === exercise)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return trainings;
  }

  getAllExercises(trainings = this.trainings) {
    return [...new Set(trainings.map(t => t.exercise))];
  }

  clearAllData() {
    this.trainings = [];
    this.saveData();
  }
}
