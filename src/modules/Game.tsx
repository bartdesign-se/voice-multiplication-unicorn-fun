
import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from './hooks/useTranslations';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useGameState } from './hooks/useGameState';
import { useStats } from './hooks/useStats';
import { generateQuestions } from './utils/questionGenerator';

export const Game = () => {
  const [selectedTable, setSelectedTable] = useState(2);
  const [selectedLanguage, setSelectedLanguage] = useState('fr-FR');
  const translations = useTranslations(selectedLanguage);
  const { startListening, isListening } = useSpeechRecognition(selectedLanguage);
  const { gameState, updateScore, nextQuestion } = useGameState();
  const { updateStats } = useStats();

  const handleAnswerSubmit = useCallback((answer: number) => {
    const isCorrect = answer === gameState.currentQuestion?.answer;
    updateScore(isCorrect);
    updateStats(gameState.currentQuestion, isCorrect);
    nextQuestion();
  }, [gameState.currentQuestion, updateScore, updateStats, nextQuestion]);

  return (
    <div className="game-container">
      {/* Game UI components will go here */}
    </div>
  );
};
