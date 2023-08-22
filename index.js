//import
const express = require("express"),
  url = require("url"),
  http = require("http"),
  morgan = require("morgan");

//declare variables
const app = express();

let topMovies = [
  {
	title: "Howl's Moving Castle",
	genre: "Romance"
  },
  {
	title: "Princess Mononoke",
	genre: "Action"
  },
  {
    title: "Spirited Away",
    genre: "Coming of Age"
  },
  {
    title: "The Secret World of Arriety",
    genre: "Adventure"
  },
  {
    title: "Castle in the Sky",
    genre: "Fantasy"
  },
  {
    title: "Nausicaa of the Valley of the Wind",
    genre: "Fantasy"
  },
  {
    title: "Grave of the Fireflies",
    genre: "War"
  },
  {
    title: "My Neighbor Totoro",
    genre: "Children's"
  },
  {
    title: "Kiki's Delivery Service",
    genre: "Children's"
  },
  {
    title: "Ponyo",
    genre: "Children's"
  }
];

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

app.get("/movies", (req, res) => {
  res.json(topMovies);
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