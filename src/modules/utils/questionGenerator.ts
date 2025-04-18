
export const generateQuestions = (table: number, multiplications: number[]) => {
  const questions = [];
  const totalQuestions = 10;

  while (questions.length < totalQuestions) {
    const idx = Math.floor(Math.random() * multiplications.length);
    const num = multiplications[idx];

    // Don't add the same question twice in a row
    if (questions.length > 0 && questions[questions.length - 1].num2 === num) {
      continue;
    }

    questions.push({
      num1: table,
      num2: num,
      answer: table * num
    });
  }

  return questions;
};
