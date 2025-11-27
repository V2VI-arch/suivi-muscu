// Gestionnaire des entraînements
const trainingManager = new TrainingManager();

document.addEventListener('DOMContentLoaded', () => {
  initializeForm();
  displayTrainings();
  setupFilters();
  
  // Définir la date d'aujourd'hui par défaut
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('trainingDate').value = today;
});

function initializeForm() {
  const form = document.getElementById('trainingForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const training = {
      date: document.getElementById('trainingDate').value,
      muscleGroup: document.getElementById('muscleGroup').value,
      exercise: document.getElementById('exercise').value,
      series: document.getElementById('series').value,
      reps: document.getElementById('reps').value,
      weight: document.getElementById('weight').value,
      notes: document.getElementById('notes').value
    };

    const newTraining = trainingManager.addTraining(training);
    
    // Afficher une notification de succès
    showNotification('Entraînement ajouté avec succès! ✅');
    
    // Réinitialiser le formulaire
    form.reset();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('trainingDate').value = today;
    
    // Rafraîchir la liste
    displayTrainings();
  });
}

function setupFilters() {
  const filterInput = document.getElementById('filterMuscle');
  const sortSelect = document.getElementById('sortBy');

  filterInput.addEventListener('input', displayTrainings);
  sortSelect.addEventListener('change', displayTrainings);
}

function displayTrainings() {
  const container = document.getElementById('trainingsList');
  let trainings = trainingManager.getAllTrainings();

  // Filtre par groupe musculaire
  const filterValue = document.getElementById('filterMuscle').value.toLowerCase();
  if (filterValue) {
    trainings = trainings.filter(t => 
      t.muscleGroup.toLowerCase().includes(filterValue)
    );
  }

  // Tri
  const sortBy = document.getElementById('sortBy').value;
  if (sortBy === 'oldest') {
    trainings = trainings.reverse();
  } else if (sortBy === 'volume') {
    trainings.sort((a, b) => b.volume - a.volume);
  }

  if (trainings.length === 0) {
    container.innerHTML = '<p class="text-muted">Aucun entraînement correspondant.</p>';
    return;
  }

  container.innerHTML = trainings.map(t => `
    <div class="training-card">
      <div class="training-header">
        <h3>${t.exercise}</h3>
        <span class="badge badge-${getBadgeColor(t.muscleGroup)}">${t.muscleGroup}</span>
      </div>
      <div class="training-info">
        <div class="info-group">
          <span class="label">Date:</span>
          <span>${new Date(t.date).toLocaleDateString('fr-FR', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="label">Séries:</span>
            <span>${t.series}</span>
          </div>
          <div class="info-item">
            <span class="label">Reps:</span>
            <span>${t.reps}</span>
          </div>
          <div class="info-item">
            <span class="label">Poids:</span>
            <span>${t.weight}kg</span>
          </div>
          <div class="info-item highlight">
            <span class="label">Volume:</span>
            <span>${t.volume.toFixed(0)}kg</span>
          </div>
        </div>
        ${t.notes ? `<div class="notes"><strong>Notes:</strong> ${t.notes}</div>` : ''}
      </div>
      <div class="training-actions">
        <button class="btn btn-sm" onclick="editTraining(${t.id})">✏️ Modifier</button>
        <button class="btn btn-sm btn-danger" onclick="deleteTraining(${t.id})">🗑️ Supprimer</button>
      </div>
    </div>
  `).join('');
}

function deleteTraining(id) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet entraînement?')) {
    trainingManager.deleteTraining(id);
    showNotification('Entraînement supprimé ❌');
    displayTrainings();
  }
}

function editTraining(id) {
  const training = trainingManager.getAllTrainings().find(t => t.id === id);
  if (!training) return;

  // Remplir le formulaire
  document.getElementById('trainingDate').value = training.date;
  document.getElementById('muscleGroup').value = training.muscleGroup;
  document.getElementById('exercise').value = training.exercise;
  document.getElementById('series').value = training.series;
  document.getElementById('reps').value = training.reps;
  document.getElementById('weight').value = training.weight;
  document.getElementById('notes').value = training.notes;

  // Modifier le bouton submit
  const form = document.getElementById('trainingForm');
  const oldButton = form.querySelector('button[type="submit"]');
  const newButton = document.createElement('button');
  newButton.type = 'button';
  newButton.className = 'btn primary';
  newButton.textContent = 'Mettre à jour';
  newButton.onclick = () => {
    trainingManager.updateTraining(id, {
      date: document.getElementById('trainingDate').value,
      muscleGroup: document.getElementById('muscleGroup').value,
      exercise: document.getElementById('exercise').value,
      series: parseInt(document.getElementById('series').value),
      reps: parseInt(document.getElementById('reps').value),
      weight: parseFloat(document.getElementById('weight').value),
      notes: document.getElementById('notes').value
    });
    
    showNotification('Entraînement mis à jour ✅');
    form.reset();
    form.replaceChild(oldButton.cloneNode(true), newButton);
    initializeForm();
    displayTrainings();
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('trainingDate').value = today;
  };
  
  oldButton.replaceWith(newButton);

  // Scroller vers le formulaire
  document.getElementById('trainingForm').scrollIntoView({ behavior: 'smooth' });
}

function getBadgeColor(muscleGroup) {
  const colors = {
    'Poitrine': 'red',
    'Dos': 'blue',
    'Épaules': 'purple',
    'Bras': 'green',
    'Avant-bras': 'cyan',
    'Jambes': 'orange',
    'Mollets': 'yellow',
    'Abdominaux': 'pink',
    'Cardio': 'gray'
  };
  return colors[muscleGroup] || 'gray';
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 3000);
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
