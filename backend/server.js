const { init } = require('./src/index');

console.log('Initializing server...')
init().then(() => console.log('Server ready.'));
