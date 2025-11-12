// Reconstruction project data
const reconstructionData = {
  phases: [
    {
      year: 2025,
      icon: "fa-calendar-check",
      color: "emerald",
      tasks: [
        { name: "Reconstrução da cobertura", budget: 18000, progress: 100 },
        { name: "Reconstrução do museu", budget: 15000, progress: 63 },
        { name: "Salas técnicas, posto médico/fisioterapia, secretaria e sala das modalidades", budget: 10000, progress: 0 },
        { name: "Colocação de novo piso desportivo", budget: 35000, progress: 0 },
        { name: "Abertura de porta para acesso de pessoas", budget: 1740, progress: 0, link: "https://www.unigo.pt/report/40ffc7ad-8744-467d-a181-2d7534768ac8" }
      ]
    },
    {
      year: 2026,
      icon: "fa-wrench",
      color: "orange",
      tasks: [
        { name: "Obras de renovação dos balneários", budget: 30000, progress: 0 },
        { name: "Pintura exterior do pavilhão", budget: 17180, progress: 0, link: "https://www.unigo.pt/report/9f9aed33-482d-4561-8ce6-f892b8f67199" },
        { name: "Troca caixilharia janelas", budget: 9818, progress: 0, link: "https://www.unigo.pt/report/04827cb3-b634-4c15-8bc4-d7c1fa5bb5e7" },
        { name: "Troca material nas tabelas de proteção da quadra", budget: 16200, progress: 0, link: "https://unigo-app.vercel.app/report/b5218126-8b59-42fc-bb04-78761cb45f66" },
        { name: "Verificação e reparação de cobertura", budget: 3850, progress: 0 }
      ]
    },
    {
      year: 2027,
      icon: "fa-dumbbell",
      color: "gray",
      tasks: [
        { name: "Colocação de bancada", budget: 30300, progress: 0, link: "https://www.unigo.pt/report/1063e54a-2e19-49eb-b80c-b4ae9dbc1cfe" },
        { name: "Uniformização do piso fora da quadra", budget: 15670, progress: 0, link: "https://www.unigo.pt/report/9c8b30e0-1ca5-467a-80db-0f3378f7b392" }
      ]
    }
  ]
};

// Calculate phase progress
function calculatePhaseProgress(tasks) {
  if (!tasks || tasks.length === 0) return 0;
  const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
  return Math.round(totalProgress / tasks.length);
}

// Calculate total project progress
function calculateTotalProgress() {
  let totalTasks = 0;
  let totalProgress = 0;
  
  reconstructionData.phases.forEach(phase => {
    phase.tasks.forEach(task => {
      totalTasks++;
      totalProgress += task.progress;
    });
  });
  
  return Math.round(totalProgress / totalTasks);
}

// Calculate total budget for a phase
function calculatePhaseBudget(tasks) {
  return tasks.reduce((sum, task) => sum + task.budget, 0);
}

// Calculate total project budget
function calculateTotalBudget() {
  let total = 0;
  reconstructionData.phases.forEach(phase => {
    total += calculatePhaseBudget(phase.tasks);
  });
  return total;
}

// Calculate total spent based on task progress
function calculateTotalSpent() {
  let totalSpent = 0;
  reconstructionData.phases.forEach(phase => {
    phase.tasks.forEach(task => {
      totalSpent += (task.budget * task.progress) / 100;
    });
  });
  return Math.round(totalSpent);
}

// Format currency
function formatCurrency(amount) {
  return amount.toLocaleString('pt-PT');
}

// Get color classes based on progress
function getProgressColor(progress) {
  if (progress === 100) return 'emerald';
  if (progress > 0) return 'orange';
  return 'gray';
}

// Render the reconstruction page
function renderReconstructionPage() {
  // Update total progress
  const totalProgress = calculateTotalProgress();
  document.getElementById('total-progress-bar').style.width = totalProgress + '%';
  document.getElementById('total-progress-text').textContent = totalProgress + '%';
  
  // Update total budget
  const totalBudget = calculateTotalBudget();
  document.getElementById('total-budget').textContent = formatCurrency(totalBudget) + '€*';
  
  // Update total spent
  const totalSpent = calculateTotalSpent();
  document.getElementById('total-spent').textContent = formatCurrency(totalSpent) + '€';
  
  // Render phases
  const phasesContainer = document.getElementById('phases-container');
  phasesContainer.innerHTML = '';
  
  reconstructionData.phases.forEach((phase, phaseIndex) => {
    const phaseProgress = calculatePhaseProgress(phase.tasks);
    const phaseBudget = calculatePhaseBudget(phase.tasks);
    
    const phaseHTML = `
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-4">
          <i class="fa-solid ${phase.icon} text-2xl text-${phase.color}-700"></i>
          <h3 class="text-2xl font-bold text-gray-900">Ano ${phase.year}</h3>
        </div>
        <div class="mb-4">
          <div class="flex justify-between items-center mb-2">
            <span class="font-semibold text-gray-700">Progresso da Fase</span>
            <span class="text-xl font-bold text-${phase.color}-700">${phaseProgress}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden mb-4">
            <div class="bg-${phase.color}-600 h-4 rounded-full transition-all" style="width: ${phaseProgress}%"></div>
          </div>
        </div>
        
        <div class="space-y-3">
          ${phase.tasks.map(task => {
            const progressColor = getProgressColor(task.progress);
            const bgColor = progressColor === 'emerald' ? 'emerald-50' : 
                           progressColor === 'orange' ? 'orange-50' : 'gray-50';
            
            return `
              <div class="flex items-center justify-between p-4 bg-${bgColor} rounded-lg">
                <div class="flex-1">
                  <div class="font-semibold text-gray-900">${task.name}</div>
                  <div class="text-sm text-gray-600">${formatCurrency(task.budget)}€${task.link ? '*' : ''}</div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-24 bg-gray-200 rounded-full h-2">
                    <div class="bg-${progressColor}-600 h-2 rounded-full transition-all" style="width: ${task.progress}%"></div>
                  </div>
                  <span class="text-sm font-bold text-${progressColor}-700 w-12 text-right">${task.progress}%</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        <div class="mt-4 p-4 bg-${phase.color}-700 text-white rounded-lg text-center">
          <span class="text-lg font-bold">Total do ano: ${formatCurrency(phaseBudget)}€*</span>
        </div>
      </div>
    `;
    
    phasesContainer.innerHTML += phaseHTML;
  });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('phases-container')) {
    renderReconstructionPage();
  }
});
