// classes/requestHandler.js
export default class RequestHandler {

  constructor(supabase, apiVersion) {
    this.supabase = supabase;
    this.apiVersion = apiVersion;
  }

  async handleRequest(request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests (OPTIONS)
    if (request.method === 'OPTIONS') {
      // Respond with 200 OK to preflight requests
      request.writeHead(200);
      response.end();
      return; // End here, no need to proceed further for OPTIONS requests
    }
    
    console.log(`Received request: ${request.method} ${request.url}`); // Log the request method and URL

    if (request.method === 'GET' && request.url === `/api/${this.apiVersion}`) {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: `Hello, this is ${this.apiVersion} of the database.` }));
    } else if (request.method === 'GET' && request.url === `/api/${this.apiVersion}/users`) {
      try {
        console.log('Fetching users...'); // Log before fetching users
        const users = await this.getUsers();
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(users));
      } catch (error) {
        console.error('Error fetching users:', error); // Log any error
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: error.message }));
      }
    } else if (request.method === 'POST' && request.url === `/api/${this.apiVersion}/users`) {
      this.registerUser(request, response);
    } else {
      response.writeHead(405, { 'Content-Type': 'application/json' }); // (no other methods allowed)
      response.end(JSON.stringify({ message: 'Method Not Allowed' }));
    }
  }

  // GET
  async getUsers() {
    const { data, error } = await this.supabase.from('users').select('*');
    console.log('getUsers data:', data); // Log the data
    console.log('getUsers error:', error); // Log any error
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  // POST
  async registerUser(request, response) {
    let body = '';
    request.on('data', chunk=> {
      body += chunk.toString();
    })
    request.on('end', async () => {
      try {
        const userData = JSON.parse(body);
        console.log(userData);
        const { data, error } = await this.supabase
        .from('users')
        .insert([userData]);

        console.log('registerUser data:', data); // Log the data
        console.log('registerUser error:', error); // Log any error

        if (error) {
          throw new Error(error.details);
        }

        response.writeHead(201, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify("successfully registered user"));

      } catch (e) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: e.message }));
      }
    });
  }

  // GET /users should return a specific user?
}