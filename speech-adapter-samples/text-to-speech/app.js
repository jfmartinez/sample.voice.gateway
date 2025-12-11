require('dotenv').config();

const PORT = process.env.PORT || 8010;

require('./lib/ConnectionHandler').start({ port: PORT });
