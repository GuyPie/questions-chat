const { Client } = require('@elastic/elasticsearch');

const client = new Client({ node: 'http://localhost:9200' });;

const getSimilarQuestions = async (questionVector) => {
  const { body: { hits: { hits } } } = await client.search({
    body: {
      query: {
        script_score: {
          query: { match_all: {} },
          script: {
            source: 'cosineSimilarity(params.query_vector, "text_vector")',
            params: { query_vector: questionVector }
          }
        }
      }
    }
  });

  return hits;
}

const insertQuestion = async (question, questionVector) => {
  return client.index({
    index: 'questions',
    body: {
      id: question.id,
      author: question.authorId,
      text: question.text,
      text_vector: questionVector
    }
  });
}

module.exports = { getSimilarQuestions, insertQuestion };
