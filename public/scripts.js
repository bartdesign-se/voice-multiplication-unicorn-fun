document.addEventListener('DOMContentLoaded', () => {
  const mainMenu = document.getElementById('main-menu');
  const gameScreen = document.getElementById('game-screen');
  const settingsScreen = document.getElementById('settings-screen');
  const statsScreen = document.getElementById('stats-screen');
  const summaryScreen = document.getElementById('summary-screen');

  const tablesContainer = document.querySelector('.tables-container');
  const settingsTableSelect = document.getElementById('settings-table-select');
  const multiplicationCheckboxes = document.getElementById('multiplication-checkboxes');
  const statsTableSelect = document.getElementById('stats-table-select');
  const statsContainer = document.getElementById('stats-container');
  const summaryCorrect = document.getElementById('summary-correct');
  const summaryTime = document.getElementById('summary-time');
  const summaryResults = document.getElementById('summary-results');
  const medalsContainer = document.getElementById('medals-container');

  const backToMenuBtn = document.getElementById('back-to-menu');
  const settingsBtn = document.getElementById('settings-btn');
  const statsBtn = document.getElementById('stats-btn');
  const backFromSettingsBtn = document.getElementById('back-from-settings');
  const backFromStatsBtn = document.getElementById('back-from-stats');
  const playAgainBtn = document.getElementById('play-again');
  const backToMainBtn = document.getElementById('back-to-main');

  let currentTable = null;
  let activeMultiplications = {};
  let questions = [];
  let currentQuestionIndex = 0;
  let score = 0;
  let startTime = 0;
  let endTime = 0;
  let userAnswers = [];
  let language = localStorage.getItem('language') || 'en-US';
  const languageSelector = document.getElementById('language');
  languageSelector.value = language;

  // Function to switch between screens
  function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
  }

  // Function to generate multiplication tables buttons
  function generateTableButtons() {
    tablesContainer.innerHTML = '';
    for (let i = 1; i <= 12; i++) {
      const button = document.createElement('button');
      button.textContent = i;
      button.classList.add('table-btn');
      button.addEventListener('click', () => startGame(i));
      tablesContainer.appendChild(button);
    }
  }

  // Function to start the game
  function startGame(table) {
    currentTable = table;
    loadActiveMultiplications();
    generateQuestions();
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    startTime = Date.now();
    updateScoreDisplay();
    updateQuestionDisplay();
    showScreen('game-screen');
  }

  // Function to generate the questions
  function generateQuestions() {
    questions = [];
    let availableMultiplications = [];
    for (let i = 1; i <= 12; i++) {
      if (activeMultiplications[i] !== false) {
        availableMultiplications.push(i);
      }
    }
    if (availableMultiplications.length === 0) {
      availableMultiplications = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    }
    for (let i = 0; i < 10; i++) {
      const multiplier = availableMultiplications[Math.floor(Math.random() * availableMultiplications.length)];
      questions.push({
        table: currentTable,
        multiplier: multiplier,
        answer: currentTable * multiplier
      });
    }
  }

  // Function to update the score display
  function updateScoreDisplay() {
    document.getElementById('current-score').textContent = score;
  }

  // Function to update the question display
  function updateQuestionDisplay() {
    const question = questions[currentQuestionIndex];
    document.getElementById('current-question').textContent = `${question.table} × ${question.multiplier} = ?`;
    document.getElementById('question-number').textContent = `${currentQuestionIndex + 1}/10`;
    document.getElementById('feedback').textContent = '';
    moveUnicorn(0);
    generateCandies();
  }

  // Function to handle the answer
  function handleAnswer(userAnswer) {
    const question = questions[currentQuestionIndex];
    const isCorrect = userAnswer === question.answer;
    userAnswers.push({
      question: `${question.table} × ${question.multiplier}`,
      correctAnswer: question.answer,
      userAnswer: userAnswer,
      isCorrect: isCorrect
    });
  
    showFeedback(isCorrect, userAnswer);
  
    if (isCorrect) {
      score++;
      updateScoreDisplay();
      moveUnicorn(100);
    } else {
      moveUnicorn(50);
    }
  
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        updateQuestionDisplay();
      } else {
        endGame();
      }
    }, 1500);
  }

  function showFeedback(isCorrect, userAnswer) {
    const feedback = document.getElementById('feedback');
    const currentQuestion = document.querySelector('#current-question').textContent;
    const equation = currentQuestion.replace('?', `= ${userAnswer}`);
    
    if (isCorrect) {
      feedback.innerHTML = `<span class="answer">${equation}</span> Correct!`;
      feedback.className = 'feedback correct';
    } else {
      feedback.innerHTML = `<span class="answer">${equation}</span> Try again!`;
      feedback.className = 'feedback wrong';
    }
  }

  // Function to end the game
  function endGame() {
    endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000;
    summaryCorrect.textContent = score;
    summaryTime.textContent = timeTaken;
    generateSummaryResults();
    generateMedals();
    showScreen('summary-screen');
  }

  // Function to generate summary results
  function generateSummaryResults() {
    summaryResults.innerHTML = '';
    userAnswers.forEach(answer => {
      const resultItem = document.createElement('div');
      resultItem.classList.add('summary-result-item');
      const equation = document.createElement('div');
      equation.classList.add('summary-equation');
      equation.textContent = answer.question + ' = ' + answer.correctAnswer;
      const userAnswerDiv = document.createElement('div');
      userAnswerDiv.classList.add('summary-answer');
      if (answer.isCorrect) {
        userAnswerDiv.classList.add('correct');
        userAnswerDiv.textContent = answer.userAnswer;
      } else {
        userAnswerDiv.classList.add('wrong');
        userAnswerDiv.textContent = answer.userAnswer;
      }
      resultItem.appendChild(equation);
      resultItem.appendChild(userAnswerDiv);
      summaryResults.appendChild(resultItem);
    });
  }

  // Function to generate medals
  function generateMedals() {
    medalsContainer.innerHTML = '';
    let medal;
    if (score === 10) {
      medal = '🥇';
    } else if (score >= 7) {
      medal = '🥈';
    } else if (score >= 5) {
      medal = '🥉';
    }
    if (medal) {
      const medalItem = document.createElement('div');
      medalItem.classList.add('medal-item');
      const medalSpan = document.createElement('span');
      medalSpan.classList.add('medal');
      medalSpan.textContent = medal;
      medalItem.appendChild(medalSpan);
      medalsContainer.appendChild(medalItem);
    }
  }

  // Function to move the unicorn
  function moveUnicorn(percentage) {
    const unicorn = document.querySelector('.unicorn-game');
    unicorn.style.left = `${percentage}%`;
  }

  // Function to generate candies
  function generateCandies() {
    const candiesTrack = document.querySelector('.candies-track');
    candiesTrack.innerHTML = '';
    const numCandies = 5;
    for (let i = 0; i < numCandies; i++) {
      const candy = document.createElement('div');
      candy.classList.add('candy');
      candy.textContent = '🍬';
      const candyColors = ['#FEC6A1', '#FEF7CD', '#F2FCE2', '#D3E4FD', '#E5DEFF', '#FFDEE2'];
      candy.style.backgroundColor = candyColors[i % candyColors.length];
      candy.style.left = `${(i + 1) * (100 / (numCandies + 1))}%`;
      candiesTrack.appendChild(candy);
    }
  }

  // Function to generate settings options
  function generateSettingsOptions() {
    settingsTableSelect.innerHTML = '';
    for (let i = 1; i <= 12; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = i;
      settingsTableSelect.appendChild(option);
    }
  }

  // Function to generate multiplication checkboxes
  function generateMultiplicationCheckboxes() {
    multiplicationCheckboxes.innerHTML = '';
    for (let i = 1; i <= 12; i++) {
      const checkboxItem = document.createElement('div');
      checkboxItem.classList.add('checkbox-item');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `multiplication-${i}`;
      checkbox.value = i;
      checkbox.checked = activeMultiplications[i] !== false;
      checkbox.addEventListener('change', () => {
        activeMultiplications[i] = checkbox.checked;
        saveActiveMultiplications();
      });
      const label = document.createElement('label');
      label.textContent = i;
      label.setAttribute('for', `multiplication-${i}`);
      checkboxItem.appendChild(checkbox);
      checkboxItem.appendChild(label);
      multiplicationCheckboxes.appendChild(checkboxItem);
    }
  }

  // Function to generate stats options
  function generateStatsOptions() {
    statsTableSelect.innerHTML = '<option value="all">All Tables</option>';
    for (let i = 1; i <= 12; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = i;
      statsTableSelect.appendChild(option);
    }
  }

  // Function to generate stats
  function generateStats(table) {
    statsContainer.innerHTML = '';
    let stats = JSON.parse(localStorage.getItem('stats') || '{}');
    if (table === 'all') {
      for (let i = 1; i <= 12; i++) {
        if (stats[i]) {
          displayTableStats(i, stats[i]);
        }
      }
    } else {
      if (stats[table]) {
        displayTableStats(table, stats[table]);
      }
    }
  }

  // Function to display table stats
  function displayTableStats(table, tableStats) {
    for (let equation in tableStats) {
      const statItem = document.createElement('div');
      statItem.classList.add('stat-item');
      const equationDiv = document.createElement('div');
      equationDiv.classList.add('stat-equation');
      equationDiv.textContent = `${table} × ${equation} = ${table * equation}`;
      const progressContainer = document.createElement('div');
      progressContainer.classList.add('progress-container');
      const progressBar = document.createElement('div');
      progressBar.classList.add('progress-bar');
      const correctPercentage = (tableStats[equation].correct / tableStats[equation].total) * 100;
      progressBar.style.width = `${correctPercentage}%`;
      progressContainer.appendChild(progressBar);
      const medalsRow = document.createElement('div');
      medalsRow.classList.add('medals-row');
      const correctCount = document.createElement('div');
      correctCount.classList.add('medal-count');
      correctCount.textContent = `✅ ${tableStats[equation].correct}`;
       const totalCount = document.createElement('div');
       totalCount.classList.add('medal-count');
       totalCount.textContent = `❌ ${tableStats[equation].total - tableStats[equation].correct}`;
      medalsRow.appendChild(correctCount);
      medalsRow.appendChild(totalCount);
      statItem.appendChild(equationDiv);
      statItem.appendChild(progressContainer);
      statItem.appendChild(medalsRow);
      statsContainer.appendChild(statItem);
    }
  }

  // Function to save stats
  function saveStats(question, isCorrect) {
    let stats = JSON.parse(localStorage.getItem('stats') || '{}');
    if (!stats[question.table]) {
      stats[question.table] = {};
    }
    if (!stats[question.table][question.multiplier]) {
      stats[question.table][question.multiplier] = {
        correct: 0,
        total: 0
      };
    }
    stats[question.table][question.multiplier].total++;
    if (isCorrect) {
      stats[question.table][question.multiplier].correct++;
    }
    localStorage.setItem('stats', JSON.stringify(stats));
  }

  // Function to load active multiplications
  function loadActiveMultiplications() {
    const savedMultiplications = localStorage.getItem('activeMultiplications');
    activeMultiplications = savedMultiplications ? JSON.parse(savedMultiplications) : {};
  }

  // Function to save active multiplications
  function saveActiveMultiplications() {
    localStorage.setItem('activeMultiplications', JSON.stringify(activeMultiplications));
  }

  // Event listeners for button clicks
  backToMenuBtn.addEventListener('click', () => showScreen('main-menu'));
  settingsBtn.addEventListener('click', () => {
    showScreen('settings-screen');
    generateSettingsOptions();
    generateMultiplicationCheckboxes();
  });
  statsBtn.addEventListener('click', () => {
    showScreen('stats-screen');
    generateStatsOptions();
    generateStats('all');
  });
  backFromSettingsBtn.addEventListener('click', () => showScreen('main-menu'));
  backFromStatsBtn.addEventListener('click', () => showScreen('main-menu'));
  playAgainBtn.addEventListener('click', () => startGame(currentTable));
  backToMainBtn.addEventListener('click', () => showScreen('main-menu'));

  // Event listener for language selector
  languageSelector.addEventListener('change', () => {
    language = languageSelector.value;
    localStorage.setItem('language', language);
  });

  // Add keyboard input handling
  function initNumberKeyboard() {
    const keyboard = document.querySelector('.number-keyboard');
    let currentInput = '';

    keyboard.addEventListener('click', (e) => {
      if (!e.target.classList.contains('number-key')) return;
      
      const value = e.target.dataset.value;
      
      switch(value) {
        case 'clear':
          currentInput = '';
          break;
        case 'enter':
          if (currentInput) {
            handleAnswer(parseInt(currentInput));
            currentInput = '';
          }
          break;
        default:
          if (currentInput.length < 3) {
            currentInput += value;
          }
        }
    });
  }

  // Event listener for stats table select
  statsTableSelect.addEventListener('change', () => {
    generateStats(statsTableSelect.value);
  });

  // Initial setup
  function init() {
    generateTableButtons();
    loadActiveMultiplications();
    initNumberKeyboard();
    showScreen('main-menu');
  }

  init();
});
