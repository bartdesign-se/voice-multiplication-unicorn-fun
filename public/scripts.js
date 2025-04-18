document.addEventListener('DOMContentLoaded', () => {
  // Global variables
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let selectedTable = 2;
  let selectedLanguage = 'fr-FR';
  let currentMultiplications = [];
  let currentGame = {
    questions: [],
    answers: [],
    times: [],
    position: 0,
    score: 0,
    questionIndex: 0
  };
  let gameStartTime = 0;
  let questionStartTime = 0;
  const totalQuestions = 10;
  let gameMedals = { gold: 0, silver: 0, bronze: 0 };
  
  // Cache DOM elements
  const mainMenu = document.getElementById('main-menu');
  const gameScreen = document.getElementById('game-screen');
  const settingsScreen = document.getElementById('settings-screen');
  const statsScreen = document.getElementById('stats-screen');
  const summaryScreen = document.getElementById('summary-screen');
  const tablesContainer = document.querySelector('.tables-container');
  const languageSelect = document.getElementById('language');
  const currentQuestion = document.getElementById('current-question');
  const feedback = document.getElementById('feedback');
  const voiceIndicator = document.getElementById('voice-indicator');
  const manualInputBtn = document.getElementById('manual-input-btn');
  const manualInputPanel = document.getElementById('manual-input-panel');
  const manualAnswer = document.getElementById('manual-answer');
  const currentScore = document.getElementById('current-score');
  const questionNumber = document.getElementById('question-number');
  const candiesTrack = document.querySelector('.candies-track');
  const unicornGame = document.querySelector('.unicorn-game');
  
  // Add translations
  const translations = {
    'en-US': {
      title: 'Unicorn Multiplication Fun',
      loading: 'Loading the game...',
      settings: 'Settings',
      statistics: 'Statistics',
      chooseTable: 'Choose a Multiplication Table',
      language: 'Language:',
      back: '← Back',
      score: 'Score:',
      question: 'Question:',
      listening: 'Listening...',
      enterAnswer: 'Enter your answer',
      submit: 'Submit',
      correct: 'Correct!',
      wrong: 'Wrong! The answer is',
      tryAgain: "Sorry, I didn't catch that. Try again.",
      gameStats: 'Game Summary',
      correctAnswers: 'Correct answers:',
      timeTaken: 'Time taken:',
      seconds: 'seconds',
      playAgain: 'Play Again',
      backToMenu: 'Back to Menu',
      noStats: 'No statistics available yet. Play some games to see your progress!',
      rememberSelections: 'Remember selections',
      selectTable: 'Select Multiplication Table',
      activeMultiplications: 'Active Multiplications'
    },
    'fr-FR': {
      title: 'Multiplication Amusante avec la Licorne',
      loading: 'Chargement du jeu...',
      settings: 'Paramètres',
      statistics: 'Statistiques',
      chooseTable: 'Choisissez une Table de Multiplication',
      language: 'Langue:',
      back: '← Retour',
      score: 'Score:',
      question: 'Question:',
      listening: 'À l\'écoute...',
      enterAnswer: 'Entrez votre réponse',
      submit: 'Valider',
      correct: 'Correct !',
      wrong: 'Incorrect ! La réponse est',
      tryAgain: "Désolé, je n'ai pas compris. Réessayez.",
      gameStats: 'Résumé de la Partie',
      correctAnswers: 'Réponses correctes:',
      timeTaken: 'Temps écoulé:',
      seconds: 'secondes',
      playAgain: 'Rejouer',
      backToMenu: 'Retour au Menu',
      noStats: 'Aucune statistique disponible. Jouez pour voir votre progression !',
      rememberSelections: 'Se souvenir des sélections',
      selectTable: 'Sélectionner la Table de Multiplication',
      activeMultiplications: 'Multiplications Actives'
    }
    // Add more translations for other languages
  };
  
  // Set default language to French
  selectedLanguage = 'fr-FR';
  
  // Create a function to get translations
  const getTranslation = (key) => {
    return translations[selectedLanguage]?.[key] || translations['fr-FR'][key];
  };
  
  // Add spoken number display
  const showSpokenNumber = (number) => {
    const spokenNumberDisplay = document.createElement('div');
    spokenNumberDisplay.className = 'spoken-number';
    spokenNumberDisplay.textContent = number;
    document.body.appendChild(spokenNumberDisplay);
    
    setTimeout(() => {
      spokenNumberDisplay.remove();
    }, 1000);
  };
  
  // Check if Speech Recognition is supported
  const isSpeechRecognitionSupported = () => {
    return SpeechRecognition !== undefined;
  };
  
  // Initialize Speech Recognition
  const initSpeechRecognition = () => {
    if (!isSpeechRecognitionSupported()) {
      console.error('Speech Recognition not supported');
      // Show manual input button when speech recognition is not available
      manualInputBtn.style.display = 'block';
      return false;
    }
    
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = selectedLanguage;
    
    recognition.onstart = () => {
      voiceIndicator.style.display = 'flex';
    };
    
    recognition.onend = () => {
      voiceIndicator.style.display = 'none';
      // If recognition ends without a result, we show manual input button
      setTimeout(() => {
        if (gameScreen.classList.contains('active') && manualInputBtn.style.display !== 'block') {
          manualInputBtn.style.display = 'block';
        }
      }, 1000);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      voiceIndicator.style.display = 'none';
      manualInputBtn.style.display = 'block';
    };
    
    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript.trim().toLowerCase();
      console.log('Speech recognized:', result);
      voiceIndicator.style.display = 'none';
      
      const numericAnswer = parseVoiceResult(result);
      if (numericAnswer !== null) {
        showSpokenNumber(numericAnswer);
        checkAnswer(numericAnswer);
      } else {
        feedback.textContent = getTranslation('tryAgain');
        feedback.className = 'feedback';
        startListening();
      }
    };
    
    return true;
  };
  
  // Parse voice result to get numeric value
  const parseVoiceResult = (result) => {
    // Remove punctuation and convert to lowercase
    result = result.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
    
    // Direct numeric input
    if (!isNaN(parseInt(result))) {
      return parseInt(result);
    }
    
    // Word to number mapping for English
    const wordToNumber = {
      'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
      'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
      'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14,
      'fifteen': 15, 'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19,
      'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
      'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90
    };
    
    // Simple word number (e.g. "twelve")
    if (wordToNumber[result] !== undefined) {
      return wordToNumber[result];
    }
    
    // Handle compound numbers like "twenty one"
    const words = result.split(' ');
    if (words.length > 1) {
      let sum = 0;
      for (const word of words) {
        if (wordToNumber[word] !== undefined) {
          sum += wordToNumber[word];
        }
      }
      if (sum > 0) return sum;
    }
    
    // TODO: Add more language-specific number parsing based on selectedLanguage
    
    return null;
  };
  
  // Start listening for speech input
  const startListening = () => {
    if (recognition) {
      try {
        recognition.abort();
        recognition.start();
      } catch (e) {
        console.error('Error starting speech recognition:', e);
        setTimeout(() => {
          try { recognition.start(); } catch (e) { 
            console.error('Retry failed:', e);
            manualInputBtn.style.display = 'block';
          }
        }, 100);
      }
    } else {
      if (initSpeechRecognition()) {
        startListening();
      } else {
        manualInputBtn.style.display = 'block';
      }
    }
  };
  
  // Generate multiplication tables buttons
  const generateTableButtons = () => {
    tablesContainer.innerHTML = '';
    for (let i = 2; i <= 9; i++) {
      const button = document.createElement('button');
      button.className = 'table-btn';
      button.textContent = `${i} ×`;
      button.dataset.table = i;
      button.addEventListener('click', () => startGame(i));
      tablesContainer.appendChild(button);
    }
  };
  
  // Initialize settings screen
  const initSettingsScreen = () => {
    const tableSelect = document.getElementById('settings-table-select');
    const checkboxesContainer = document.getElementById('multiplication-checkboxes');
    const rememberSettings = document.getElementById('remember-settings');
    
    // Clear existing options
    tableSelect.innerHTML = '';
    
    // Add table options
    for (let i = 2; i <= 9; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = `${i} Times Table`;
      tableSelect.appendChild(option);
    }
    
    // Get saved settings
    const savedSettings = JSON.parse(localStorage.getItem('multiplicationSettings')) || {};
    if (savedSettings.rememberSettings) {
      rememberSettings.checked = true;
      tableSelect.value = savedSettings.selectedTable || 2;
    }
    
    // Generate checkboxes for the selected table
    const populateCheckboxes = (table) => {
      checkboxesContainer.innerHTML = '';
      for (let i = 1; i <= 10; i++) {
        const checkboxItem = document.createElement('div');
        checkboxItem.className = 'checkbox-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `mult-${table}-${i}`;
        checkbox.value = i;
        
        // Set checked state from saved settings
        if (savedSettings.activeMultiplications && 
            savedSettings.activeMultiplications[table] &&
            savedSettings.activeMultiplications[table].includes(i)) {
          checkbox.checked = true;
        } else {
          checkbox.checked = true; // Default all checked
        }
        
        const label = document.createElement('label');
        label.htmlFor = `mult-${table}-${i}`;
        label.textContent = `${table}×${i}`;
        
        checkboxItem.appendChild(checkbox);
        checkboxItem.appendChild(label);
        checkboxesContainer.appendChild(checkboxItem);
      }
    };
    
    // Initial population
    populateCheckboxes(tableSelect.value);
    
    // Event listener for table change
    tableSelect.addEventListener('change', () => {
      populateCheckboxes(tableSelect.value);
    });
    
    // Save settings button
    document.getElementById('back-from-settings').addEventListener('click', () => {
      if (rememberSettings.checked) {
        const selectedTable = parseInt(tableSelect.value);
        const activeMultiplications = {};
        
        activeMultiplications[selectedTable] = [];
        const checkboxes = checkboxesContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
          if (checkbox.checked) {
            activeMultiplications[selectedTable].push(parseInt(checkbox.value));
          }
        });
        
        const settings = {
          selectedTable,
          activeMultiplications,
          rememberSettings: true
        };
        
        localStorage.setItem('multiplicationSettings', JSON.stringify(settings));
      } else {
        localStorage.removeItem('multiplicationSettings');
      }
      
      showScreen(mainMenu);
    });
  };
  
  // Initialize statistics screen
  const initStatsScreen = () => {
    const tableSelect = document.getElementById('stats-table-select');
    const statsContainer = document.getElementById('stats-container');
    
    // Clear existing options
    tableSelect.innerHTML = '<option value="all">All Tables</option>';
    
    // Add table options
    for (let i = 2; i <= 9; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = `${i} Times Table`;
      tableSelect.appendChild(option);
    }
    
    // Display stats based on selection
    const displayStats = (tableFilter = 'all') => {
      statsContainer.innerHTML = '';
      const stats = JSON.parse(localStorage.getItem('multiplicationStats')) || {};
      
      Object.keys(stats).forEach(key => {
        const [num1, num2] = key.split('x').map(Number);
        
        if (tableFilter === 'all' || num1 === parseInt(tableFilter) || num2 === parseInt(tableFilter)) {
          const statData = stats[key];
          const statItem = document.createElement('div');
          statItem.className = 'stat-item';
          
          const equation = document.createElement('div');
          equation.className = 'stat-equation';
          equation.textContent = `${num1} × ${num2}`;
          
          const correctCount = document.createElement('div');
          correctCount.textContent = `Correct: ${statData.correctCount}`;
          
          const progressContainer = document.createElement('div');
          progressContainer.className = 'progress-container';
          
          const progressBar = document.createElement('div');
          progressBar.className = 'progress-bar';
          // Cap progress at 25 correct answers for a full bar
          const progressPercentage = Math.min(statData.correctCount / 25 * 100, 100);
          progressBar.style.width = `${progressPercentage}%`;
          
          progressContainer.appendChild(progressBar);
          
          const medalsRow = document.createElement('div');
          medalsRow.className = 'medals-row';
          
          const medals = [
            { type: 'gold', emoji: '🥇', count: statData.medals.gold || 0 },
            { type: 'silver', emoji: '🥈', count: statData.medals.silver || 0 },
            { type: 'bronze', emoji: '🥉', count: statData.medals.bronze || 0 }
          ];
          
          medals.forEach(medal => {
            if (medal.count > 0) {
              const medalCount = document.createElement('div');
              medalCount.className = 'medal-count';
              medalCount.textContent = `${medal.emoji} ${medal.count}`;
              medalsRow.appendChild(medalCount);
            }
          });
          
          statItem.appendChild(equation);
          statItem.appendChild(correctCount);
          statItem.appendChild(progressContainer);
          statItem.appendChild(medalsRow);
          
          statsContainer.appendChild(statItem);
        }
      });
      
      // If no stats available
      if (statsContainer.children.length === 0) {
        const noStats = document.createElement('div');
        noStats.textContent = 'No statistics available yet. Play some games to see your progress!';
        noStats.style.textAlign = 'center';
        noStats.style.padding = '2rem 0';
        statsContainer.appendChild(noStats);
      }
    };
    
    // Initial display
    displayStats();
    
    // Event listener for table change
    tableSelect.addEventListener('change', (e) => {
      displayStats(e.target.value);
    });
  };
  
  // Show a specific screen
  const showScreen = (screen) => {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
    
    // Special handling for different screens
    if (screen === gameScreen) {
      manualInputBtn.style.display = 'none';
      manualInputPanel.classList.remove('active');
    }
  };
  
  // Start the game with the selected table
  const startGame = (table) => {
    selectedTable = table;
    currentGame = {
      questions: [],
      answers: [],
      times: [],
      position: 0,
      score: 0,
      questionIndex: 0
    };
    gameMedals = { gold: 0, silver: 0, bronze: 0 };
    
    // Get active multiplications from settings
    const settings = JSON.parse(localStorage.getItem('multiplicationSettings')) || {};
    let activeMultiplications = [];
    
    if (settings.activeMultiplications && settings.activeMultiplications[table]) {
      activeMultiplications = settings.activeMultiplications[table];
    } else {
      // Default to all multiplications 1-10
      activeMultiplications = Array.from({ length: 10 }, (_, i) => i + 1);
    }
    
    currentMultiplications = activeMultiplications;
    
    // Generate random questions
    generateQuestions(table, activeMultiplications);
    
    // Setup game screen
    setupGameScreen();
    
    // Show game screen
    showScreen(gameScreen);
    
    // Start game
    gameStartTime = Date.now();
    nextQuestion();
  };
  
  // Generate random questions for the game
  const generateQuestions = (table, multiplications) => {
    const questions = [];
    
    // If we have fewer than 10 active multiplications, we'll repeat some
    while (questions.length < totalQuestions) {
      // Randomly select from active multiplications
      const idx = Math.floor(Math.random() * multiplications.length);
      const num = multiplications[idx];
      
      // Don't add the same question twice in a row
      if (questions.length > 0 && questions[questions.length - 1].multiplication === num) {
        continue;
      }
      
      questions.push({
        num1: table,
        num2: num,
        multiplication: num,
        answer: table * num
      });
    }
    
    currentGame.questions = questions;
  };
  
  // Setup game screen with candies
  const setupGameScreen = () => {
    // Reset scores and counters
    currentScore.textContent = '0';
    questionNumber.textContent = '1';
    feedback.textContent = '';
    feedback.className = 'feedback';
    
    // Reset unicorn position
    unicornGame.style.left = '0px';
    
    // Generate candies
    candiesTrack.innerHTML = '';
    const trackWidth = candiesTrack.clientWidth;
    const candySpacing = trackWidth / (totalQuestions + 1);
    
    for (let i = 0; i < totalQuestions; i++) {
      const candy = document.createElement('div');
      candy.className = 'candy';
      candy.dataset.index = i;
      
      // Select a random candy color
      const candyColors = [
        '#FEC6A1', '#FEF7CD', '#F2FCE2', 
        '#D3E4FD', '#E5DEFF', '#FFDEE2'
      ];
      const colorIndex = Math.floor(Math.random() * candyColors.length);
      candy.style.backgroundColor = candyColors[colorIndex];
      
      // Add candy emoji or number
      const candyEmojis = ['🍬', '🍭', '🍫', '🍪', '🧁', '🍩'];
      const emojiIndex = Math.floor(Math.random() * candyEmojis.length);
      candy.textContent = candyEmojis[emojiIndex];
      
      // Position candy
      candy.style.left = `${(i + 1) * candySpacing}px`;
      
      candiesTrack.appendChild(candy);
    }
  };
  
  // Display the next question
  const nextQuestion = () => {
    if (currentGame.questionIndex >= currentGame.questions.length) {
      showGameSummary();
      return;
    }
    
    const question = currentGame.questions[currentGame.questionIndex];
    currentQuestion.textContent = `${question.num1} × ${question.num2} = ?`;
    feedback.textContent = '';
    feedback.className = 'feedback';
    questionNumber.textContent = currentGame.questionIndex + 1;
    
    // Start listening for answer
    questionStartTime = Date.now();
    startListening();
  };
  
  // Check if the answer is correct
  const checkAnswer = (userAnswer) => {
    const question = currentGame.questions[currentGame.questionIndex];
    const isCorrect = userAnswer === question.answer;
    const responseTime = (Date.now() - questionStartTime) / 1000; // in seconds
    
    currentGame.answers.push({
      question: `${question.num1}×${question.num2}`,
      expectedAnswer: question.answer,
      userAnswer,
      isCorrect,
      responseTime
    });
    
    currentGame.times.push(responseTime);
    
    // Update feedback
    if (isCorrect) {
      feedback.textContent = 'Correct!';
      feedback.className = 'feedback correct';
      currentGame.score++;
      currentScore.textContent = currentGame.score;
      
      // Assign medal based on response time
      if (responseTime < 1) {
        gameMedals.gold++;
      } else if (responseTime < 2) {
        gameMedals.silver++;
      } else if (responseTime < 3) {
        gameMedals.bronze++;
      }
      
      // Move unicorn forward
      moveUnicorn(true);
      
      // Update stats
      updateStats(question.num1, question.num2, responseTime);
    } else {
      feedback.textContent = `Wrong! The answer is ${question.answer}`;
      feedback.className = 'feedback wrong';
      
      // Move unicorn backward
      moveUnicorn(false);
    }
    
    // Move to next question after a delay
    setTimeout(() => {
      currentGame.questionIndex++;
      nextQuestion();
    }, 1500);
  };
  
  // Move unicorn forward or backward
  const moveUnicorn = (forward) => {
    const trackWidth = candiesTrack.clientWidth;
    const totalSteps = totalQuestions * 2; // Double the steps to allow backward movement
    const stepSize = trackWidth / totalSteps;
    
    if (forward) {
      currentGame.position++;
      
      // Check if unicorn reached a candy
      const candyIndex = Math.floor(currentGame.position / 2);
      if (currentGame.position % 2 === 0 && candyIndex < totalQuestions) {
        // "Eat" the candy with animation
        const candy = document.querySelector(`.candy[data-index="${candyIndex - 1}"]`);
        if (candy) {
          candy.style.transform = 'scale(0)';
          setTimeout(() => {
            candy.style.opacity = '0';
          }, 300);
        }
      }
    } else {
      // Move backward but not beyond start
      if (currentGame.position > 0) {
        currentGame.position--;
      }
    }
    
    // Update unicorn position
    const newPosition = Math.min(trackWidth - 100, currentGame.position * stepSize);
    unicornGame.style.left = `${newPosition}px`;
  };
  
  // Update statistics after each correct answer
  const updateStats = (num1, num2, responseTime) => {
    const key = `${num1}x${num2}`;
    const stats = JSON.parse(localStorage.getItem('multiplicationStats')) || {};
    
    if (!stats[key]) {
      stats[key] = {
        correctCount: 0,
        medals: { gold: 0, silver: 0, bronze: 0 }
      };
    }
    
    // Increment correct count
    stats[key].correctCount++;
    
    // Add medal based on response time
    if (responseTime < 1) {
      stats[key].medals.gold = (stats[key].medals.gold || 0) + 1;
    } else if (responseTime < 2) {
      stats[key].medals.silver = (stats[key].medals.silver || 0) + 1;
    } else if (responseTime < 3) {
      stats[key].medals.bronze = (stats[key].medals.bronze || 0) + 1;
    }
    
    localStorage.setItem('multiplicationStats', JSON.stringify(stats));
  };
  
  // Show game summary screen
  const showGameSummary = () => {
    const totalTime = Math.round((Date.now() - gameStartTime) / 1000);
    const correctCount = currentGame.answers.filter(a => a.isCorrect).length;
    
    // Update summary stats
    document.getElementById('summary-correct').textContent = correctCount;
    document.getElementById('summary-time').textContent = totalTime;
    
    // Update medals container
    const medalsContainer = document.getElementById('medals-container');
    medalsContainer.innerHTML = '';
    
    const medals = [
      { type: 'gold', emoji: '🥇', count: gameMedals.gold },
      { type: 'silver', emoji: '🥈', count: gameMedals.silver },
      { type: 'bronze', emoji: '🥉', count: gameMedals.bronze }
    ];
    
    medals.forEach(medal => {
      if (medal.count > 0) {
        const medalItem = document.createElement('div');
        medalItem.className = 'medal-item';
        
        const medalEmoji = document.createElement('div');
        medalEmoji.className = 'medal';
        medalEmoji.textContent = medal.emoji;
        
        const medalCount = document.createElement('div');
        medalCount.textContent = medal.count;
        
        medalItem.appendChild(medalEmoji);
        medalItem.appendChild(medalCount);
        medalsContainer.appendChild(medalItem);
      }
    });
    
    // Show all question results
    const resultsContainer = document.getElementById('summary-results');
    resultsContainer.innerHTML = '';
    
    currentGame.answers.forEach((answer, index) => {
      const resultItem = document.createElement('div');
      resultItem.className = 'summary-result-item';
      
      const equation = document.createElement('div');
      equation.className = 'summary-equation';
      equation.textContent = `${answer.question} = ?`;
      
      const answerElement = document.createElement('div');
      answerElement.className = `summary-answer ${answer.isCorrect ? 'correct' : 'wrong'}`;
      
      const userAnswerSpan = document.createElement('span');
      userAnswerSpan.textContent = answer.userAnswer;
      
      answerElement.appendChild(userAnswerSpan);
      
      if (!answer.isCorrect) {
        const correctAnswer = document.createElement('span');
        correctAnswer.textContent = ` (${answer.expectedAnswer})`;
        answerElement.appendChild(correctAnswer);
      }
      
      const timeSpan = document.createElement('span');
      timeSpan.textContent = ` [${answer.responseTime.toFixed(1)}s]`;
      answerElement.appendChild(timeSpan);
      
      resultItem.appendChild(equation);
      resultItem.appendChild(answerElement);
      resultsContainer.appendChild(resultItem);
    });
    
    // Setup action buttons
    document.getElementById('play-again').addEventListener('click', () => {
      startGame(selectedTable);
    });
    
    document.getElementById('back-to-main').addEventListener('click', () => {
      showScreen(mainMenu);
    });
    
    // Show summary screen
    showScreen(summaryScreen);
  };
  
  // Event listeners
  document.getElementById('settings-btn').addEventListener('click', () => {
    initSettingsScreen();
    showScreen(settingsScreen);
  });
  
  document.getElementById('stats-btn').addEventListener('click', () => {
    initStatsScreen();
    showScreen(statsScreen);
  });
  
  document.getElementById('back-to-menu').addEventListener('click', () => {
    if (recognition) recognition.abort();
    showScreen(mainMenu);
  });
  
  document.getElementById('back-from-settings').addEventListener('click', () => {
    showScreen(mainMenu);
  });
  
  document.getElementById('back-from-stats').addEventListener('click', () => {
    showScreen(mainMenu);
  });
  
  manualInputBtn.addEventListener('click', () => {
    manualInputPanel.classList.add('active');
    manualAnswer.focus();
  });
  
  document.getElementById('close-manual-input').addEventListener('click', () => {
    manualInputPanel.classList.remove('active');
  });
  
  document.getElementById('submit-manual-answer').addEventListener('click', () => {
    const answer = parseInt(manualAnswer.value);
    if (!isNaN(answer)) {
      checkAnswer(answer);
      manualAnswer.value = '';
      manualInputPanel.classList.remove('active');
    }
  });
  
  manualAnswer.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('submit-manual-answer').click();
    }
  });
  
  // Language selection
  languageSelect.addEventListener('change', (e) => {
    selectedLanguage = e.target.value;
    localStorage.setItem('selectedLanguage', selectedLanguage);
    
    if (recognition) {
      recognition.lang = selectedLanguage;
    }
    
    updateUITranslations();
  });
  
  // Load saved language preference
  const savedLanguage = localStorage.getItem('selectedLanguage');
  if (savedLanguage) {
    languageSelect.value = savedLanguage;
    selectedLanguage = savedLanguage;
  }
  
  // Initialize the app
  const init = () => {
    generateTableButtons();
    initSpeechRecognition();
    
    // Set default language if no saved preference
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (!savedLanguage) {
      languageSelect.value = 'fr-FR';
      selectedLanguage = 'fr-FR';
      localStorage.setItem('selectedLanguage', 'fr-FR');
    }
    
    updateUITranslations();
  };
  
  init();
});
