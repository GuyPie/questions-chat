const { BOT_ID } = require('./constants');
const { getMessage, getRepliesToMessage, addMessage } = require('./messages');

const findMostSimilarQuestionWithNonBotAnswer = (questions) => {
  for (let i = 0; i < questions.length; i++) {
    if (questions[i]._score < 0.5) {
      break;
    } 

    const repliesToQuestion = getRepliesToMessage(questions[i]._source.id);
    const nonBotAnswer = repliesToQuestion.find(reply => reply.author.id !== BOT_ID);
    if (nonBotAnswer) {
      return { originalQuestion: getMessage(questions[i]._source.id), nonBotAnswer };
    }
  }

  return {};
}

const sendBotAnswerIfAppropriate = (question, similarQuestions) => {
  const { originalQuestion, nonBotAnswer } = findMostSimilarQuestionWithNonBotAnswer(similarQuestions);

  if (!originalQuestion) return false;

  let text;

  if (similarQuestions[0]._score > 0.95) {
    text = `Are you just copying and pasting questions? Anyway, if ${nonBotAnswer.author.firstName} knows what they're talking about the answer is "${nonBotAnswer.text}".`;
  } else if (similarQuestions[0]._score > 0.8) {
    text = `I'm pretty sure ${nonBotAnswer.author.firstName} already covered this! When asked "${originalQuestion.text}", their answer was "${nonBotAnswer.text}".`;
  } else {
    text = `I don't know if this helps, but when asked "${originalQuestion.text}", ${nonBotAnswer.author.firstName} had this to say - "${nonBotAnswer.text}".`;
  }

  addMessage({
    authorId: BOT_ID,
    text,
    quotedMessageId: question.id,
  });

  return true;
};

module.exports = { sendBotAnswerIfAppropriate };
