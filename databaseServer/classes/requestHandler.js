// classes/requestHandler.js
const bcrypt = require('bcrypt'); 
const TokenHandler = require('./tokenHandler.js'); 
const saltRounds = 10;
const url = require('url');

class RequestHandler {

  constructor(supabase, apiVersion) {
    this.supabase = supabase;
    this.apiVersion = apiVersion;
    this.allowedOrigins = [
      'https://insideout-psi.vercel.app',
      'https://localhost:3000',
    ]
  }

  async handleRequest(request, response) {
    const origin = request.headers.origin;

    if (this.allowedOrigins.includes(origin)) {
      response.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      response.setHeader('Access-Control-Allow-Origin', null);
    }
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setHeader('Access-Control-Allow-Credentials', 'true'); 

    // Handle preflight requests (OPTIONS)
    if (request.method === 'OPTIONS') {
      // Respond with 200 OK to preflight requests
      response.writeHead(200);
      response.end();
      return; // End here, no need to proceed further for OPTIONS requests
    }

    const parsedUrl = url.parse(request.url, true);
    const user_id = parsedUrl.query.user_id;

    if (request.method === 'GET' && request.url === `/COMP4537/projects/insideout/api/${this.apiVersion}`) {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: `Hello, this is ${this.apiVersion} of the database.` }));
    } else if (request.method === 'GET' && request.url === `/COMP4537/projects/insideout/api/${this.apiVersion}/users`) {
      try {
        const users = await this.getUsers();
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(users));
      } catch (error) {
        console.error('Error fetching users:', error); // Log any error
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: error.message }));
      }
    } else if (request.method === 'POST' && request.url === `/COMP4537/projects/insideout/api/${this.apiVersion}/register`) {
      this.registerUser(request, response);
    } else if (request.method === 'POST' && request.url === `/COMP4537/projects/insideout/api/${this.apiVersion}/login`) {
      this.loginUser(request, response);
    } else if (request.method === 'GET' && request.url === `/COMP4537/projects/insideout/api/${this.apiVersion}/verify-token`) {
      this.verifyToken(request, response);
    } else if (request.method === 'GET' && parsedUrl.pathname === `/COMP4537/projects/insideout/api/${this.apiVersion}/api-calls`) {
      if (user_id) {
        let userStats = await this.getUserApiCalls(user_id);
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(userStats));
      } else {
        let stats = await this.getApiCalls();
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(stats));
      }
    } else {
      response.writeHead(405, { 'Content-Type': 'application/json' }); // (no other methods allowed)
      response.end(JSON.stringify({ message: 'Method Not Allowed' }));
    }
  }

  // GET
  async getUsers() {
    const { data, error } = await this.supabase.from('users').select('*');
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  // POST
  async registerUser(request, response) {
    /**
      c. Server-Side
      On the server:

      Validate Input: Ensure the email and password meet your criteria (e.g., valid email format, password strength).
      Check for Existing User: Query the database to check if the email already exists.
      Hash Password: Use a library like bcrypt to hash the password before storing it in the database for security.
      Insert into Database: Store the user details in the users table.
     */
    let body = '';
    request.on('data', chunk => {
      body += chunk.toString();
    })

    request.on('end', async () => {
      try {
        const userData = JSON.parse(body);

        // hash password before insertion
        userData.password = await bcrypt.hash(userData.password, saltRounds);

        const { data, error } = await this.supabase
          .from('users')
          .insert([userData]);

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

  async hashPassword(password) {
    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(password, salt);
      return hash;
    } catch (err) {
      console.error('Error hashing password:', err);
      throw err;
    }
  }

  async loginUser(req, res) {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const { email, password } = JSON.parse(body);

        // Retrieve the user from the database
        const { data, error } = await this.supabase.from('users').select('*').eq('email', email).single();
        if (error) {
          throw error;
        }

        const user = data;

        // Compare the provided password with the hashed password from the database
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          throw new Error('Invalid password');
        }

        // Generate a JWT token
        let token = TokenHandler.generateToken(user);

        // success route
        // httpOnly JWT cookie attached
        // Assuming `token` is the generated JWT or session ID
        // Manually set the Set-Cookie header
        const cookie = `authToken=${token}; HttpOnly; Secure; SameSite=None; Max-Age=3600; Path=/;`;
        res.setHeader('Set-Cookie', cookie);


        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Login successful' }));
      } catch (e) {
        // console.error('Error logging in user:', e);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: e.message, details: e.details }));
      }
    });
  }

  async verifyToken(request, response) {
    try {
      const cookieHeader = request.headers.cookie || '';
      const token = cookieHeader.split('authToken=')[1];

      if (!token) {
        response.writeHead(401, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: 'Unauthorized - No token found' }));
        return;
      }

      const payload = TokenHandler.verifyToken(token);
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: 'Token is valid', info: payload }));
    } catch (error) {
      response.writeHead(403, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: 'Invalid token' }));
    }
  }

  async getApiCalls() {
    const { data, error } = await this.supabase.from('api_calls').select('*');
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async getUserApiCalls(userId) {
    const { data, error } = await this.supabase.from('api_calls').select('*').eq('user_id', userId);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}

module.exports = RequestHandler;