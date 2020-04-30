const short = require('short-uuid');

const questions = [];

const addQuestion = ({ author, text }) => {
  const question = {
    id: short.generate(),
    author,
    text,
    answers: [],
  };
  questions.push(question);

  return question;
}

const getQuestion = (questionId) => {
  return questions.find(currQuestion => currQuestion.id === questionId);
}

const addAnswer = (questionId, answer) => {
  const question = questions.find(currQuestion => currQuestion.id === questionId);

  if (question) {
    question.answers.push(answer);
  }
}

const getQuestions = () => questions;

module.exports = { addQuestion, getQuestion, addAnswer, getQuestions };
