//import
const express = require("express"),
  url = require("url"),
  http = require("http"),
  morgan = require("morgan"),
  bodyParser = require("boddy-parser");

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
  res.json(movies);
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