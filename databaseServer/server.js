// require('dotenv').config();
import 'dotenv/config';
// const http = require("http");
// const RequestHandler = require('./classes/requestHandler.js');
import RequestHandler from './classes/requestHandler.js';
import { createClient } from '@supabase/supabase-js';

import http from 'http';

const API_VERSION = 'v1';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Create an instance of the RequestHandler class
const requestHandler = new RequestHandler(supabase, API_VERSION);

class Server {
  constructor(requestHandler) {
    this.server = http.createServer(requestHandler.handleRequest.bind(requestHandler));
  }
}

const dbServer = new Server(requestHandler);

// local host test
dbServer.server.listen(3000, () => {
  console.log("Server is listening on port 3000");
});

// live server
// dbServer.server.listen();