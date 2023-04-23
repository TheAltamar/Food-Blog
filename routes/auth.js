const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const crypto = require("crypto");

//remember that if the auth doesnt work we can just erase this and add a random string to the secret key in the video it is 2:12:52
const SECRET = process.env.SECRET;

function Router(database) {
  // Create an instance of the Express router
  const router = express.Router();

  const _database = database;

  //-------------COOKIE HANDLING-----------------//
  //Fetch new cookies everytime a request comes in
  router.use(
    session({
      secret: SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );

  //tell passport we have setted up cookie handling
  router.use(passport.authenticate("session"));

  //Allow the authenticaded user and allowe it to be accesible in the template
  router.use((req, res, next) => {
    //if the user is saved in the request save that in the response
    if (req.user) {
      res.locals.user = req.user;
    }
    //move on to the next middleware
    next();
  });

  //-------------AUTHENTICATION-----------------//

  //logging in
  passport.use(
    new LocalStrategy(async function verify(username, password, callback) {
      // Find current user with username
      let user = await _database.collections.users.findOne({
        username: username,
      });
      //Recreate password
      crypto.pbkdf2(
        password,
        user.salt,
        310000,
        32,
        "sha256",
        (error, hashedPassword) => {
          if (error || !hashedPassword) {
            //error out

            return;
          }

          //Verify that password matches the one in the database

          if (user.password !== hashedPassword.toString("hex")) {
            //ERROR OUT
          } else {
            return callback(null, user);
          }
        }
      );
    })
  );

  //registering

  //render login form
  router.get("/login", (req, res) => {
    res.render("login.ejs", {});
  });

  //render registration form
  router.get("/register", (req, res) => {
    res.render("register.ejs", {});
  });

  //login
  router.post("/login", async (req, res, next) => {
    let authenticate = passport.authenticate("local", async (_, user) => {
      await new Promise((resolve) => {
        req.login(
          {
            id: user._id.toString(),
            email: user.email,
          },
          () => {
            resolve();
          }
        );
      });
      res.redirect("/");
    });
    authenticate(req, res, next); //passport authenticate returns a function that we need to call with the req, res, next
  });

  //registering
  router.post("/register", async (req, res) => {
    let data = req.body;
    const salt = crypto.randomBytes(16).toString("hex");

    const hashedPassword = await new Promise((resolve) => {
      crypto.pbkdf2(
        data.password,
        salt,
        310000,
        32,
        "sha256",
        (_, hashedPassword) => {
          resolve(hashedPassword);
        }
      );
    });

    let user = await _database.collections.users.insertOne({
      username: data.username,
      email: data.email,
      salt: salt,
      password: hashedPassword.toString("hex"),
    });

    await new Promise((resolve) => {
      req.login(
        {
          id: user.insertedId.toString(),
          email: data.email,
        },
        () => {
          resolve();
        }
      );
    });

    res.redirect("/");
  });

  return router;
}

module.exports = Router;
