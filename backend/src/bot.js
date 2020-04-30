const { BOT_NAME } = require('./constants');
const { getQuestion, addAnswer } = require('./questions');

const findMostSimilarQuestionWithNonBotAnswer = (questions) => {
  for (let i = 0; i < questions.length; i++) {
    if (questions[i]._score < 0.5) {
      break;
    } 

    const originalQuestion = getQuestion(questions[i]._source.id);
    const nonBotAnswer = originalQuestion && originalQuestion.answers.find(answer => answer.author !== BOT_NAME);
    if (nonBotAnswer) {
      return { originalQuestion, nonBotAnswer };
    }
  }

  return {};
}

const sendBotAnswerIfAppropriate = (question, similarQuestions) => {
  const { originalQuestion, nonBotAnswer } = findMostSimilarQuestionWithNonBotAnswer(similarQuestions);

  if (!nonBotAnswer) return false;

  let text;

  if (similarQuestions[0]._score > 0.95) {
    text = `Are you just copying and pasting questions? Anyway, if ${nonBotAnswer.author} knows what they're talking about the answer is "${nonBotAnswer.text}".`;
  } else if (similarQuestions[0]._score > 0.8) {
    text = `I'm pretty sure ${nonBotAnswer.author} already covered this! When asked "${originalQuestion.text}", their answer was "${nonBotAnswer.text}".`;
  } else {
    text = `I don't know if this helps, but when asked "${originalQuestion.text}", ${nonBotAnswer.author} had this to say - "${nonBotAnswer.text}".`;
  }

  addAnswer(question.id, {
    author: BOT_NAME,
    text,
  });

  return true;
};

module.exports = { sendBotAnswerIfAppropriate };
