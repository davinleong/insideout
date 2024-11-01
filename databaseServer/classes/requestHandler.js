// classes/requestHandler.js
import bcrypt from 'bcrypt';
import TokenHandler from './tokenHandler.js';
const saltRounds = 10;

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
    } else if (request.method === 'POST' && request.url === `/api/${this.apiVersion}/register`) {
      this.registerUser(request, response);
    } else if (request.method === 'POST' && request.url === `/api/${this.apiVersion}/login`) {
      this.loginUser(request, response);
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
        // console.log("before hash", userData.password);
        userData.password = await bcrypt.hash(userData.password, saltRounds);
        // console.log("after hash", userData.password);

        const { data, error } = await this.supabase
          .from('users')
          .insert([userData]);

        // console.log('registerUser data:', data); // Log the data
        // console.log('registerUser error:', error); // Log any error

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
        // console.log("Logging in user...", email);

        // Retrieve the user from the database
        const { data, error } = await this.supabase.from('users').select('*').eq('email', email).single();
        if (error) {
          throw error;
        }

        const user = data;
        // console.log("Retrieved user:", user);

        // Compare the provided password with the hashed password from the database
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          throw new Error('Invalid password');
        }

        // Generate a JWT token
        console.log('Generating token...');
        let token = TokenHandler.generateToken(user);
        console.log('Generated token:', token);

        // success route
        // httpOnly JWT cookie attached
        // Assuming `token` is the generated JWT or session ID
        // Manually set the Set-Cookie header
        const cookie = `authToken=${token}; HttpOnly; Secure; Max-Age=3600`;
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

  // GET /users should return a specific user?
}