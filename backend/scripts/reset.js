const { Client } = require('@elastic/elasticsearch');

async function reset() {
  console.log('Removing all data from ElasticSearch...');
  const client = new Client({ node: 'http://localhost:9200' })

  await client.indices.delete({ index: 'questions' });
  await client.indices.create({
    index: 'questions',
    body: {
      mappings: {
        properties: {
          id: {
            type: 'text'
          },
          author: {
            type: 'text'
          },
          text: {
            type: 'text',
          },
          text_vector: {
            type: 'dense_vector',
            dims: 512
          }
        }
      }
    }
  });
  console.log('Data removed.');
}

reset();
