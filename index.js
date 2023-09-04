//import
const express = require("express"),
  url = require("url"),
  http = require("http"),
  morgan = require("morgan"),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  Models = require("./models.js");

//declare variables
const app = express();

//use body-parser
app.use(bodyParser.json());
app.use(express.urlencoded({extended: true}));

//import mongoose models
const Movies = Models.Movie;
const Users = Models.User;

//connect to MongoDB database movies from task 2.7
mongoose.connect("mongodb://127.0.0.1:27017/movies", {useNewUrlParser: true, useUnifiedTopology: true});

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
app.get("/movies", async (req, res) => {
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
app.get("/movies/:Title", async (req, res) => {
  await Movies.findOne({ Title: req.params.Tile })
  .then((movie) => {
    res.status(201).json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

  //return data about a genre by name/title             <-
app.get("/movies/:Genre", (req, res) => {
  res.json(movies.find((movie) =>
  { return movie.Genre === req.params.Genre }));
});

  //return data about a director by name                <-
app.get("/movies/:Director", (req, res) => {
  res.json(movies.find((movie) =>
  { return movie.Director === req.params.Director }));
});

  //return all users
app.get("/users", async (req, res) => {
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
app.post("/users", async (req, res) => {
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
app.get("/users/:Username", async (req, res) => {
  await Users.findOne({ Username: req.params.Username })
  .then((user) => {
    res.json(user);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

  //allow users to update their username                <-
app.put("/users/:Username", async (req, res) => {
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
app.post("/users/:Username/movies/:MovieID", async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username },
    {$push: {FavoriteMovies: req.params.MovieID }},
    {new: true})
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

  //allow users to remove a movie from their list of favorites
app.delete("/users/:Name/list/:Title", (req, res) => {
  res.status(200).send(req.params.movie + " has been removed from your list.");
});

  //allow existing users to deregister
app.delete("/users/:Username", async (req, res) => {
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