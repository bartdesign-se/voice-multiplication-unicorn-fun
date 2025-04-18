
import { useCallback } from 'react';

interface Question {
  num1: number;
  num2: number;
  answer: number;
}

export const useStats = () => {
  const updateStats = useCallback((question: Question | null, isCorrect: boolean) => {
    if (!question) return;

    const stats = JSON.parse(localStorage.getItem('multiplicationStats') || '{}');
    const key = `${question.num1}x${question.num2}`;

    if (!stats[key]) {
      stats[key] = {
        correctCount: 0,
        medals: { gold: 0, silver: 0, bronze: 0 }
      };
    }

    if (isCorrect) {
      stats[key].correctCount++;
    }

    localStorage.setItem('multiplicationStats', JSON.stringify(stats));
  }, []);

  return { updateStats };
};
