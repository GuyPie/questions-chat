require('@tensorflow/tfjs-node')
const { load } = require('@tensorflow-models/universal-sentence-encoder');

const { QUESTION_INBOUND_MESSAGE_TYPE, ANSWER_INBOUND_MESSAGE_TYPE } = require('./constants');
const { getSimilarQuestions, insertQuestion } = require('./elasticsearch');
const { addAnswer, addQuestion } = require('./questions');
const { initSocket, onConnectionMessage, sendFeedToAll } = require('./socket');
const { sendBotAnswerIfAppropriate } = require('./bot');

const processQuestion = async (model, wss, question) => {
  const embeddings = await model.embed(question.text);
  const [vector] = await embeddings.array();
  
  try {
    const similarQuestions = await getSimilarQuestions(vector);
    const answerSent = sendBotAnswerIfAppropriate(question, similarQuestions);
    if (answerSent) {
      sendFeedToAll(wss);
    }

    await insertQuestion(question, vector);
  } catch (e) {
    console.log('Error finding similar questions or inserting a question to ElasticSearch', e);
  }
}


const init = async () => {
  const model = await load();
  const wss = initSocket();
  
  onConnectionMessage(wss, (userId, message) => {
    if (message.type === QUESTION_INBOUND_MESSAGE_TYPE) {
      const question = addQuestion({ 
        author: userId,
        text: message.text,
      });
      processQuestion(model, wss, question);
    } else if (message.type === ANSWER_INBOUND_MESSAGE_TYPE) {
      addAnswer(message.questionId, {
        author: userId,
        text: message.text,
      });
    }
  });
}

module.exports = { init };
