//import
const express = require("express"),
  url = require("url"),
  http = require("http"),
  morgan = require("morgan"),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  Models = require("./models.js"),
  bcrypt = require("bcrypt"),
  dotenv = require("dotenv").config(),
  fs = require("fs"),
  fileUpload = require("express-fileupload"),
  mime = require("mime-types"),
  { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");

//import express-validator
const { check, validationResult } = require("express-validator");

//declare variables
const app = express();

//use body-parser
app.use(bodyParser.json());
app.use(express.urlencoded({extended: true}));
app.use(fileUpload());

//import cors
const cors = require("cors");
//allows all domains:
app.use(cors()); 
// to restrict, replace with:
// let allowedOrigins = ["*", "http://localhost:8080", "http://localhost:1234", "http://localhost:4200",
//   "https://popopolis.netlify.app", "https://kellysdev.github.io/movie-Angular-client", "https://kellysdev.github.io"]
// app.use(cors({
//   origin: (origin, callback) => {
//     if(!origin) return callback (null, true);
//     if(allowedOrigins.indexOf(origin) === -1) {
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

//connect to MongoDB database
// mongoose.connect("mongodb://127.0.0.1:27017/test", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect(process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true});

//setup the logger
app.use(morgan("common"));

//static files
app.use(express.static("public"));

//request routing
app.get("/", (req, res) => {
  res.send("Welcome to Popopolis!");
});

let UPLOAD_TEMP_PATH = process.env.TEMP_PATH;

/**
 * Get all movies
 * @function
 * @name getAllMovies
 * @param {string} Endpoint path
 * @param {object} Express request object
 * @param {object} Express response object
 * @returns {object[]} Array of movie objects
 * @throws {Error} Sends error status code and message if an error is encountered
 */

app.get("/movies", passport.authenticate("jwt", { session: false}), (req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

/**
 * Get a single movie by title
 * @function
 * @name getSingleMovie
 * @param {string} Endpoint path
 * @param {object} Express request object
 * @param {object} Express response object
 * @returns {object} Movie object
 * @throws {Error} Sends error status code and message if an error is encountered
 */

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

/**
 * Get genre by name
 * @function
 * @name getGenre
 * @param {string} Endpoint path
 * @param {object} Express request object
 * @param {object} Express response object
 * @returns {object} Genre object
 * @throws {Error} Sends error status code and message if an error is encountered
 */

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

/**
 * Get director by name
 * @function
 * @name getDirector
 * @param {string} Endpoint path
 * @param {object} Express request object
 * @param {object} Express response object
 * @returns {object} Director object
 * @throws {Error} Sends error status code and message if an error is encountered
 */

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

/**
 * Get all users
 * @function
 * @name getAllUsers
 * @param {string} Endpoint path
 * @param {object} Express request object
 * @param {object} Express response object
 * @returns {object[]} Array of user objects
 * @throws {Error} Sends error status code and message if an error is encountered
 */

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

/**
 * Create a new user
 * @function
 * @name registerUser
 * @param {string} Endpoint path
 * @param {object} Express request object
 * @param {object} Express response object
 * @returns {object} New user object
 * @throws {Error} Sends error status code and message if the user input data doesn't pass validation
 * @throws {Error} Sends error status code and message if there is an error creating the user
 */

app.post("/users", 
[ check("Username", "Username is required").isLength({min: 5}),
  check("Username", "Username contains non alphanumeric characters - not allowed").isAlphanumeric(),
  check("Password", "Password is required").not().isEmpty(),
  check("Email", "Email does not appear to be valid").isEmail()
], async (req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  let hashedPassword = Users.hashPassword(req.body.Password);
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + "already exists");
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
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

/**
 * Get a single user by username
 * @function
 * @name getUser
 * @param {string} Enpoint path
 * @param {object} Express request object
 * @param {object} Express response object
 * @returns {object} User object
 * @throws {Error} Sends error status code and message if an error is encountered
 */

app.get("/users/:Username", passport.authenticate("jwt", { session: false}), async (req, res) => {
  await Users.findOne({ Username: req.params.Username })
  .then((user) => {
    res.json(user);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

/**
 * Update user info
 * @function
 * @name updateUser
 * @param {string} Endpoint path
 * @param {object} Express request object
 * @param {object} Express response object
 * @returns {object} Updated user object
 * @throws {Error} Sends error status code and message if the user input data doesn't pass validation
 * @throws {Error} Sends error status code and message if there is an error creating the user
 */

app.put("/users/:Username", passport.authenticate("jwt", { session: false}), 
[ check("Username", "Username is required").isLength({min: 5}),
  check("Username", "Username contains non alphanumeric characters - not allowed").isAlphanumeric(),
  check("Password", "Password is required").not().isEmpty(),
  check("Email", "Email does not appear to be valid").isEmail()
], async (req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  //condition: check username first
  if(req.user.Username !== req.params.Username) {
    return res.status(400).send("Permission denied");
  }
  let hashedPassword = Users.hashPassword(req.body.Password);
  await Users.findOneAndUpdate({ Username: req.params.Username },
    {$set: {
      Username: req.body.Username,
      Password: hashedPassword,
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

/**
 * Add movie to favorites
 * @function
 * @name addToFavorites
 * @param {string} Endpoint path
 * @param {object} Express request object
 * @param {object} Express response object
 * @returns {string} Sends a message that the movie was successfully added to favorites
 * @throws {Error} Sends error status code and message if an error was encountered
 */

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

/**
 * Remove movie from favorites
 * @function
 * @name removeFromFavorites
 * @param {string} Endpoint path
 * @param {object} Express request object
 * @param {object} Express response object
 * @returns {string} Sends a message that the movie was successfully removed from favorites
 * @throws {Error} Sends error status code and message if an error was encountered
 */

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

/**
 * Delete user account
 * @function
 * @name deleteUser
 * @param {string} endpoint path
 * @param {object} Express request object
 * @param {object} Express response object
 * @returns {string} Sends a message that the user was successfully deleted
 * @throws {Error} Sends error status code and message if an error was encountered
 * @throws {Error} Sends an error message if the user was not found
 */

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

//////
// s3 upload endpoints
//////

// instantiate and configure client object
const s3Client = new S3Client({
  region: "us-west-2",
  // endpoint: "http://localhost:4566",
  // forcePathStyle: true
});

// list objects in a s3 bucket
app.get("/images", async (req, res) => {
  try {
    const listObjectsParams = {
      Bucket: process.env.IMAGES_BUCKET
    }
    const listObjectsResponse = await s3Client.send(new ListObjectsV2Command(listObjectsParams));

    if(listObjectsResponse.Contents.length === 0) {
      res.send("The bucket is empty.");
    } else {
      res.status(200).json(listObjectsResponse); 
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("There was an error retrieving the bucket contents.");
  }
});


// post an object to a s3 bucket
app.post("/images", async (req, res) => {
  try {
    console.log(req.files);
    const file = req.files.image;
    const fileName = req.files.image.name;
    // const tempPath = `${UPLOAD_TEMP_PATH}/${fileName}`;
    
    // file.mv(tempPath, (err) => {
    //   console.log(err);
    //   res.status(500);
    // });

    const putObjectParams = {
      "Body": file.data,
      "Bucket": process.env.IMAGES_BUCKET, // required
      "Key": "original-images/" + fileName // required
    };

    await s3Client.send(new PutObjectCommand(putObjectParams));

    res.send("Image uploaded successfully.");

  } catch (error) {
    console.log(error);
    res.status(500).send("There was an error uploading image.");
  }
});


// get an object from a s3 bucket
app.get("/images/:imageName", async (req, res) => {
  try {
    const fileName = req.params.imageName;
    const mimeType = mime.lookup(fileName);

    if (!mimeType) {
      return res.status(400).send("Invalid image type.");
    }

    const getObjectParams = {
      "Bucket": process.env.IMAGES_BUCKET, // required
      "Key": fileName, // required
      "RepsonseContentType": "image/png"
    };

    const getObjectResponse = await s3Client.send(new GetObjectCommand(getObjectParams));

    res.setHeader("Content-Type", mimeType);
    getObjectResponse.Body.pipe(res);
    
  } catch (error) {
    console.log(error);
    res.status(500).send("Error retrieving item from bucket.");
  }
});


//error handling
app.use((err, req, res, next) => {
  if (err) {
    next(err);
    console.error(err.stack);
    res.status(500).send("Express error:" + err);
  }
});

//listen
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});