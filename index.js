//import
const express = require("express"),
  url = require("url"),
  http = require("http"),
  morgan = require("morgan"),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  Models = require("./models.js"),
  bcrypt = require("bcrypt");

//import express-validator
const { check, validationResult } = require("express-validator");

//declare variables
const app = express();

//use body-parser
app.use(bodyParser.json());
app.use(express.urlencoded({extended: true}));

//import cors
const cors = require("cors");
app.use(cors()); //replace this with let allowedOrigins = ["http://localhost:8080", ]

// app.use(cors({
//   origin: (origin, callback) => {
//     if(!origin) return callback (null, true);
//     if(allowedOrigins.indexof(origin) === -1) {
//       let message = "The CORS policy for this application doesn't allow access from origin " + origin;
//       return callback(new Error(message ), false);
//     }
//     return callback(null, true);
//   }
// }));

//import authentication local file
let auth = require("./auth")(app);

//import passport module and local file
const passport = require("passport");
require("./passport");

//import mongoose models
const Movies = Models.Movie;
const Users = Models.User;

//connect to MongoDB database movies from task 2.7
mongoose.connect("mongodb://127.0.0.1:27017/test", {useNewUrlParser: true, useUnifiedTopology: true});

//create server
http.createServer((request, response) => {
  let addr = request.url;
  q = url.parse(addr, true);
  filePath = "";
});

//setup the logger
app.use(morgan("common"));

//static files
app.use(express.static("public"));

//request routing
app.get("/", (req, res) => {
  res.send("Welcome to my app!");
});

  //return list of all movies
app.get("/movies", passport.authenticate("jwt", { session: false }), async (req, res) => {
  await Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

  //return data for a single movie by title
app.get("/movies/:Title", passport.authenticate("jwt", { session: false}), async (req, res) => {
  await Movies.findOne({ Title: req.params.Title })
  .then((movie) => {
    res.status(201).json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

  //return data about a genre by name
app.get("/movies/Genre/:Name", passport.authenticate("jwt", { session: false}), async (req, res) => {
  await Movies.findOne({ "Genre.Name": req.params.Name })
  .then((movie) => {
    res.status(201).json(movie.Genre);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

  //return data about a director by name
app.get("/movies/Director/:Name", passport.authenticate("jwt", { session: false}), async (req, res) => {
  await Movies.findOne({ "Director.Name": req.params.Name })
  .then((movie) => {
    res.status(201).json(movie.Director);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

  //return all users
app.get("/users", passport.authenticate("jwt", { session: false}), async (req, res) => {
  await Users.find()
  .then((users) => {
    res.status(201).json(users);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error " + err);
  });
});

  //allow users to register
app.post("/users", 
[ check("Username", "Username is required").isLength({min: 5}),
  check("Username", "Username contains non alphanumeric characters - not allowed").isAlphanumeric,
  check("Password", "Password is required").not().isEmpty,
  check("Email", "Email does not appear to be valid").isEmail
], async (req, res) => {
  let hashedPassword = Users.hashPassword(req.body.Password);
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + "already exists");
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) => {res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send("Error: " + error);
        })
      }
    })
  .catch((error) => {
    console.error(error);
    res.status(500).send("Error: " + error);
  });
});

  //return user by username
app.get("/users/:Username", passport.authenticate("jwt", { session: false}), async (req, res) => {
  let hashedPassword = Users.hashPassword(req.body.Password);
  await Users.findOne({ Username: req.params.Username })
  .then((user) => {
    res.json(user);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

  //allow users to update their info
app.put("/users/:Username", passport.authenticate("jwt", { session: false}), async (req, res) => {
  //condition: check username first
  if(req.user.Username !== req.params.Username) {
    return res.status(400).send("Permission denied");
  }
  let hashedPassword = Users.hashPassword(req.body.Password);
  await Users.findOneAndUpdate({ Username: req.params.Username },
    {$set: {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }) // this line returns the updated document
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  })
});

  //all users to add a movie to their list of favorites
app.post("/users/:Username/movies/:MovieID", passport.authenticate("jwt", { session: false}), async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username },
    {$push: {FavoriteMovies: req.params.MovieID }},
    {new: true})
  .then((updatedUser) => {
    res.status(200).send("This movie has been added to your list.");
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

  //allow users to remove a movie from their list of favorites
app.delete("/users/:Username/movies/:MovieID", passport.authenticate("jwt", { session: false}), async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username },
    {$pull: {FavoriteMovies: req.params.MovieID }},
    {new: true})
  .then((updatedUser) => {
    res.status(200).send("This movie has been removed from your list.");
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

  //allow existing users to deregister
app.delete("/users/:Username", passport.authenticate("jwt", { session: false}), async (req, res) => {
  await Users.findOneAndRemove({ Username: req.params.Username })
  .then((user) => {
    if(!user) {
      res.status(400).send(req.params.Username + " was not found");
    } else {
      res.status(200).send(req.params.Username + " was deleted.");
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

//error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

//listen
app.listen(8080, () => {
  console.log("Your app is running on port 8080.");
});