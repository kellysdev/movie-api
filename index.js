//import
const express = require("express"),
  url = require("url"),
  http = require("http"),
  morgan = require("morgan"),
  bodyParser = require("body-parser");

//declare variables
const app = express();

//use body-parser
app.use(bodyParser.json());

//create an "in-memory" array of objects
let movies = [
  {
    ImageURL: "https://www.imdb.com/title/tt0347149/mediaviewer/rm2848505089/?ref_=tt_ov_i",
    Title: "Howl's Moving Castle",
    Genre: "Fantasy",
    Director: "Hayao Miyazaki"
  },
  {
    ImageURL: "https://www.imdb.com/title/tt0119698/mediaviewer/rm2697706753/?ref_=tt_ov_i",
    Title: "Princess Mononoke",
    Genre: "Action",
    Director: "Hayao Miyazaki"
  },
  {
    ImageURL: "https://www.imdb.com/title/tt0245429/mediaviewer/rm4207852801/?ref_=tt_ov_i",
    Title: "Spirited Away",
    Genre: "Fantasy",
    Director: "Hayao Miyazaki"
  },
  {
    ImageURL: "https://www.imdb.com/title/tt1517268/mediaviewer/rm2419599361/?ref_=tt_ov_i",
    Title: "Barbie",
    Genre: "Comedy",
    Director: "Greta Gerwig"
  },
  {
    ImageURL: "https://www.imdb.com/title/tt1160419/?ref_=nv_sr_srsg_0_tt_8_nm_0_q_dune",
    Title: "Dune",
    Genre: "Drama",
    Director: "Denis Villeneuve"
  }
];

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

//return data about a genre by name/title
app.get("/movies/:Genre", (req, res) => {
  res.json(movies.find((movie) =>
  { return movie.Genre === req.params.Genre }));
});

//return data about a director by name
app.get("/movies/:Director", (req, res) => {
  res.json(movies.find((movie) =>
  { return movie.Director === req.params.Director }));
});

//allow usesrs to register
app.post("/users", (req, res) => {
  let newUser = req.body;

  if (!newUser.name) {
    const message = "Missing name in request body";
    res.status(400).send(message);
  } else {
    users.push(newUser);
    res.status(201).send(newUser);
  }
});

//allow users to update their username
app.post("/users/:Name/:Username", (req, res) => {
  let users = users.find((user) => {
    return user.Name === req.params.Name
  });

  if (users) {
    users.Name[req.params.Name] = parseInt(req.params.Username);
    res.status(201).send("Your username has been updated to " + req.params.Username);
  } else {
    res.status(404).send("User " + req.params.Name + " was not found.");
  }
});

//all users to add a movie to their list of favorites
app.post("/movies/:Title/add", (req, res) => {
  //click a button on a movie page to add to list?
  res.status(201).send(req.params.Title + " has been added to your list.");
});

//allow users to remove a movie from their list of favorites
app.delete("/users/:Username/favorites/:Title", (req, res) => {
  //logic
  res.status(200).send(req.params.Title + " has been removed from your list.");
});

//allow existing users to deregister
app.delete("/users/:Username", (req, res) => {
  //logic
  res.status(200).send(req.params.username + " has been removed from [app name].");
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