// Gestionnaire de la carte du corps
class BodyMapManager {
  constructor() {
    this.storageKey = 'workoutData';
    this.loadTrainings();
    this.muscleColorMap = {
      'Poitrine': '#chest',
      'Dos': '#back',
      'Épaules': '#shoulders',
      'Bras': '#leftArm,#rightArm',
      'Avant-bras': '#leftForearm,#rightForearm',
      'Jambes': '#leftThigh,#rightThigh',
      'Mollets': '#leftCalf,#rightCalf',
      'Abdominaux': '#abs',
      'Cou': '#head',
      'Cardio': null
    };
  }

  loadTrainings() {
    const data = localStorage.getItem(this.storageKey);
    this.trainings = data ? JSON.parse(data) : [];
  }

  calculateMuscleStats(metric = 'volume', startDate = null, endDate = null) {
    let filteredTrainings = this.trainings;

    if (startDate && endDate) {
      filteredTrainings = this.trainings.filter(t => {
        const date = new Date(t.date);
        return date >= startDate && date <= endDate;
      });
    }

    const stats = {};

    filteredTrainings.forEach(training => {
      const group = training.muscleGroup;
      if (!stats[group]) {
        stats[group] = {
          count: 0,
          volume: 0,
          totalReps: 0,
          totalWeight: 0,
          trainings: []
        };
      }

      stats[group].count++;
      stats[group].volume += training.volume || 0;
      stats[group].totalReps += training.reps || 0;
      stats[group].totalWeight += training.weight || 0;
      stats[group].trainings.push(training);
    });

    // Calculer les valeurs pour la métrique demandée
    const result = {};
    Object.keys(stats).forEach(group => {
      const data = stats[group];
      switch (metric) {
        case 'volume':
          result[group] = data.volume;
          break;
        case 'reps':
          result[group] = data.totalReps;
          break;
        case 'count':
          result[group] = data.count;
          break;
        case 'avgWeight':
          result[group] = data.count > 0 ? data.totalWeight / data.count : 0;
          break;
      }
    });

    return { result, stats };
  }

  getColorIntensity(value, maxValue) {
    if (maxValue === 0) return '#e0e7ff';

    const intensity = Math.min(value / maxValue, 1);
    const hue = 260; // Violet
    const lightness = 95 - (intensity * 80); // De 95% à 15%

    return `hsl(${hue}, 100%, ${lightness}%)`;
  }

  updateHeatmap(metric, startDate, endDate) {
    const { result, stats } = this.calculateMuscleStats(metric, startDate, endDate);

    // Trouver la valeur max
    const maxValue = Math.max(...Object.values(result), 1);

    // Mettre à jour les couleurs
    Object.entries(result).forEach(([group, value]) => {
      const color = this.getColorIntensity(value, maxValue);
      const selectors = this.muscleColorMap[group];

      if (selectors) {
        const ids = selectors.split(',');
        ids.forEach(id => {
          const element = document.querySelector(id.trim());
          if (element) {
            element.setAttribute('style', `fill:${color};stroke:#4f46e5;stroke-width:2;cursor:pointer;`);
          }
        });
      }
    });

    return { result, stats };
  }
}

// Instance globale
const bodyMapManager = new BodyMapManager();

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  updateBodyMap();
});

function setupEventListeners() {
  const metricSelect = document.getElementById('mapMetric');
  const periodSelect = document.getElementById('mapPeriod');

  metricSelect.addEventListener('change', updateBodyMap);
  periodSelect.addEventListener('change', updateBodyMap);

  // Ajouter les event listeners pour les groupes musculaires
  const muscleGroups = document.querySelectorAll('.muscle-group');
  muscleGroups.forEach(group => {
    group.addEventListener('click', (e) => {
      const muscleGroup = e.target.getAttribute('data-group');
      showMuscleDetails(muscleGroup);
    });

    group.addEventListener('mouseover', (e) => {
      e.target.style.opacity = '0.8';
    });

    group.addEventListener('mouseout', (e) => {
      e.target.style.opacity = '1';
    });
  });
}

function updateBodyMap() {
  const metric = document.getElementById('mapMetric').value;
  const period = document.getElementById('mapPeriod').value;

  let startDate = null;
  let endDate = null;

  const today = new Date();
  endDate = new Date();

  if (period === 'week') {
    startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === 'month') {
    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  }

  bodyMapManager.updateHeatmap(metric, startDate, endDate);
}

function showMuscleDetails(muscleGroup) {
  const metric = document.getElementById('mapMetric').value;
  const period = document.getElementById('mapPeriod').value;

  let startDate = null;
  let endDate = null;

  const today = new Date();
  endDate = new Date();

  if (period === 'week') {
    startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === 'month') {
    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  }

  const { result, stats } = bodyMapManager.calculateMuscleStats(metric, startDate, endDate);
  const data = stats[muscleGroup];

  if (!data) {
    document.getElementById('muscleInfo').innerHTML = `
      <p class="text-muted">Aucun entraînement pour ${muscleGroup}</p>
    `;
    return;
  }

  const avgWeight = data.count > 0 ? (data.totalWeight / data.count).toFixed(1) : 0;
  const avgReps = data.count > 0 ? (data.totalReps / data.count).toFixed(0) : 0;

  document.getElementById('muscleInfo').innerHTML = `
    <div class="muscle-detail-card">
      <h3>${muscleGroup}</h3>
      <div class="detail-stats">
        <div class="detail-stat">
          <span class="label">Entraînements</span>
          <span class="value">${data.count}</span>
        </div>
        <div class="detail-stat">
          <span class="label">Volume total</span>
          <span class="value">${data.volume.toFixed(0)}kg</span>
        </div>
        <div class="detail-stat">
          <span class="label">Poids moyen</span>
          <span class="value">${avgWeight}kg</span>
        </div>
        <div class="detail-stat">
          <span class="label">Reps totales</span>
          <span class="value">${data.totalReps}</span>
        </div>
        <div class="detail-stat">
          <span class="label">Reps moyennes</span>
          <span class="value">${avgReps}</span>
        </div>
      </div>

      <h4>Exercices</h4>
      <div class="exercise-list">
        ${data.trainings.map(training => `
          <div class="exercise-item">
            <strong>${training.exercise}</strong>
            <span>${training.series}x${training.reps} @ ${training.weight}kg (${training.volume}kg)</span>
            <small>${new Date(training.date).toLocaleDateString('fr-FR')}</small>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Classe AccountManager pour vérifier le compte
class AccountManager {
  constructor() {
    this.storageKey = 'userAccount';
    this.loadAccount();
  }

  loadAccount() {
    const data = localStorage.getItem(this.storageKey);
    this.account = data ? JSON.parse(data) : null;
  }

  hasAccount() {
    return this.account !== null;
  }
}

const accountManager = new AccountManager();

// Vérifier le compte au chargement
window.addEventListener('load', () => {
  if (!accountManager.hasAccount()) {
    showAccountRequiredMessage();
  }
});

function showAccountRequiredMessage() {
  const container = document.querySelector('main .container');
  if (container) {
    const message = document.createElement('div');
    message.className = 'card alert-card';
    message.innerHTML = `
      <h2>⚠️ Compte requis</h2>
      <p>Vous devez d'abord créer un compte pour voir votre carte du corps.</p>
      <a href="account.html" class="btn primary">Créer mon compte</a>
    `;

    const mainContent = container.querySelector('h1');
    if (mainContent) {
      mainContent.after(message);
    }
  }
}
