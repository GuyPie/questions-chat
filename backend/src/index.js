require('@tensorflow/tfjs-node')
const { load } = require('@tensorflow-models/universal-sentence-encoder');

const { getSimilarQuestions, insertQuestion } = require('./elasticsearch');
const { addMessage } = require('./messages');
const Socket = require('./socket');
const { sendBotAnswerIfAppropriate } = require('./bot');

const processQuestion = async (model, wss, question) => {
  const embeddings = await model.embed(question.text);
  const [vector] = await embeddings.array();
  
  try {
    const similarQuestions = await getSimilarQuestions(vector);
    const answerSent = sendBotAnswerIfAppropriate(question, similarQuestions);
    if (answerSent) {
      wss.sendFeed();
    }

    await insertQuestion(question, vector);
  } catch (e) {
    console.log('Error finding similar questions or inserting a question to ElasticSearch', e);
  }
}


const init = async () => {
  const model = await load();
  const wss = new Socket();
  
  wss.onConnectionMessage((userId, message) => {
    const question = addMessage({ 
      authorId: userId,
      text: message.text,
      quotedMessageId: message.quotedMessageId,
    });

    if (!message.quotedMessageId) {
      processQuestion(model, wss, question);
    }
  });
}

module.exports = { init };
