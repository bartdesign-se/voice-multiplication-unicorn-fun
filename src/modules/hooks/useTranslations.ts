import { useMemo } from 'react';

const translations = {
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
  },
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
  }
};

export const useTranslations = (language: string) => {
  return useMemo(() => {
    const getTranslation = (key: string) => {
      return translations[language]?.[key] || translations['fr-FR'][key];
    };
    return { getTranslation };
  }, [language]);
};
