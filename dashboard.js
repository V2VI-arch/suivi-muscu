// Gestionnaire du tableau de bord
const trainingManager = new TrainingManager();

document.addEventListener('DOMContentLoaded', () => {
  updateDashboard();
});

function updateDashboard() {
  const allTrainings = trainingManager.getAllTrainings();
  
  // Derniers entraînements
  updateRecentTrainings(allTrainings.slice(0, 5));
  
  // Stats rapides
  updateQuickStats(allTrainings);
  
  // Groupes musculaires
  updateMuscleGroupsChart(allTrainings);
}

function updateRecentTrainings(trainings) {
  const container = document.getElementById('recentTrainings');
  
  if (trainings.length === 0) {
    container.innerHTML = '<p class="text-muted">Aucun entraînement enregistré.</p>';
    return;
  }

  container.innerHTML = trainings.map(t => `
    <div class="training-item">
      <div class="training-header">
        <strong>${t.exercise}</strong>
        <span class="badge">${t.muscleGroup}</span>
      </div>
      <div class="training-details">
        <span>${new Date(t.date).toLocaleDateString('fr-FR')}</span>
        <span>${t.series}x${t.reps} @ ${t.weight}kg</span>
        <span class="volume">Volume: ${t.volume.toFixed(0)}kg</span>
      </div>
    </div>
  `).join('');
}

function updateQuickStats(trainings) {
  const thisWeek = trainingManager.getTrainingsThisWeek();
  const muscleGroups = trainingManager.getUniqueMuscleGroups(trainings);
  const totalVolume = trainingManager.getTotalVolume(trainings);

  document.getElementById('totalTrainings').textContent = trainings.length;
  document.getElementById('weekTrainings').textContent = thisWeek.length;
  document.getElementById('totalVolume').textContent = totalVolume.toFixed(0);
  document.getElementById('muscleGroups').textContent = muscleGroups.length;
}

function updateMuscleGroupsChart(trainings) {
  const container = document.getElementById('muscleGroupsChart');
  const stats = trainingManager.getMuscleGroupStats(trainings);
  
  if (Object.keys(stats).length === 0) {
    container.innerHTML = '<p class="text-muted">Aucune donnée disponible.</p>';
    return;
  }

  const sorted = Object.entries(stats)
    .sort((a, b) => b[1].volume - a[1].volume)
    .slice(0, 5);

  const maxVolume = Math.max(...sorted.map(([_, s]) => s.volume));

  container.innerHTML = sorted.map(([group, stats]) => `
    <div class="muscle-group-bar">
      <div class="bar-label">${group}</div>
      <div class="bar-container">
        <div class="bar-fill" style="width: ${(stats.volume / maxVolume) * 100}%"></div>
        <span class="bar-value">${stats.volume.toFixed(0)}kg</span>
      </div>
    </div>
  `).join('');
}

// Script de training-manager.js
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
