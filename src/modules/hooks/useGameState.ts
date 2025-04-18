
import { useState, useCallback } from 'react';

interface Question {
  num1: number;
  num2: number;
  answer: number;
}

interface GameState {
  questions: Question[];
  currentQuestion: Question | null;
  score: number;
  questionIndex: number;
}

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    questions: [],
    currentQuestion: null,
    score: 0,
    questionIndex: 0
  });

  const startGame = useCallback((table: number, multiplications: number[]) => {
    const questions = generateQuestions(table, multiplications);
    setGameState({
      questions,
      currentQuestion: questions[0],
      score: 0,
      questionIndex: 0
    });
  }, []);

  const updateScore = useCallback((isCorrect: boolean) => {
    if (isCorrect) {
      setGameState(prev => ({
        ...prev,
        score: prev.score + 1
      }));
    }
  }, []);

  const nextQuestion = useCallback(() => {
    setGameState(prev => {
      const nextIndex = prev.questionIndex + 1;
      return {
        ...prev,
        currentQuestion: prev.questions[nextIndex] || null,
        questionIndex: nextIndex
      };
    });
  }, []);

  return {
    gameState,
    startGame,
    updateScore,
    nextQuestion
  };
};
