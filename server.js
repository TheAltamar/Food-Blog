//import libraries that I need
const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const DatabaseService = require("./database/database.js");

//Set up the port using .env file
dotenv.config({ path: ".env" });
const PORT = process.env.PORT || 8080;

//Import the Router function from the routes/blog.js file
const BlogRouter = require("./routes/blog.js");

//Import the router function from Auth.js
const AuthRouter = require("./routes/auth.js");

//Create a function that will set up the server
async function setupServer() {
  // Create an instance of the Express application
  const app = express();

  //connect to database
  const database = new DatabaseService();
  await database.setup();

  //Allow to render ejs templates from our routes
  app.set("view engine", "ejs");

  app.use(bodyParser());

  app.use("/", BlogRouter(database));
  app.use("/", AuthRouter(database));

  //listen on port
  app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
  });
}

setupServer();
