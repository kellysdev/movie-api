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
const Movies = Models.Moviel;
const Users = Models.User;

//connect to MongoDB database movies from task 2.7
mongoose.connect("mongodb://localhost:27017/movies", {useNewUrlParser: true, useUnifiedTopology: true});

//create an "in-memory" array of objects
// let movies = [
//   {
//     ImageURL: "https://www.imdb.com/title/tt0347149/mediaviewer/rm2848505089/?ref_=tt_ov_i",
//     Title: "Howl's Moving Castle",
//     Genre: "Fantasy",
//     Director: "Hayao Miyazaki"
//   },
//   {
//     ImageURL: "https://www.imdb.com/title/tt0119698/mediaviewer/rm2697706753/?ref_=tt_ov_i",
//     Title: "Princess Mononoke",
//     Genre: "Action",
//     Director: "Hayao Miyazaki"
//   },
//   {
//     ImageURL: "https://www.imdb.com/title/tt0245429/mediaviewer/rm4207852801/?ref_=tt_ov_i",
//     Title: "Spirited Away",
//     Genre: "Fantasy",
//     Director: "Hayao Miyazaki"
//   },
//   {
//     ImageURL: "https://www.imdb.com/title/tt1517268/mediaviewer/rm2419599361/?ref_=tt_ov_i",
//     Title: "Barbie",
//     Genre: "Comedy",
//     Director: "Greta Gerwig"
//   },
//   {
//     ImageURL: "https://www.imdb.com/title/tt1160419/?ref_=nv_sr_srsg_0_tt_8_nm_0_q_dune",
//     Title: "Dune",
//     Genre: "Drama",
//     Director: "Denis Villeneuve"
//   }
// ];

let users = [];

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
app.get("/movies", (req, res) => {
  res.json(movies);
});

  //return data for a single movie by title
app.get("/movies/:Title", (req, res) => {
  res.json(movies.find((movie) => 
  { return movie.Title === req.params.Title }));
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
    res.status(500).send("Error " = err);
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
app.post("/users/:Name/:Username", (req, res) => {
  res.status(201).send("Your username has been updated.");
});

  //all users to add a movie to their list of favorites
app.post("/movies/:Title/add", (req, res) => {
  res.status(201).send(req.params.Title + " has been added to your list.");
});

  //allow users to remove a movie from their list of favorites
app.delete("/users/:Name/list/:Title", (req, res) => {
  res.status(200).send(req.params.movie + " has been removed from your list.");
});

  //allow existing users to deregister
app.delete("/users/:Name/:Username", (req, res) => {
  res.status(200).send(req.params.Username + " has been removed from myflix.");
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