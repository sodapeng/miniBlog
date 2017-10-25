const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser"); 
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const config = require("./config/database");


// Set up Mongodb
var options = {
  user: 'liangpeng',
  pass: '123'
}

mongoose.connect(config.database, options);
let db = mongoose.connection;

//check connection
db.once("open", function() {
	console.log("Connected to Mongodb");
});

//Check for DB errors
db.on("error", function(err) {
	console.log(err);
});

//Init app
const app = express();

app.set('port', (process.env.PORT || 5000));
//Bring in Models
let Article = require("./models/article");

//Load View Engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//Body parser Middleware
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Set Public folder
app.use(express.static(path.join(__dirname, "public")));

//Express session middleware 
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));

//Express message middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express validator middleware
app.use(expressValidator({
	errorFormatter: function(param, msg, value) {
		var namespace = param.split(".")
		, root = namespace.shift()
		, formParam = root;

		while(namespace.length) {
			formParam += "[" + namespace.shift() + "]";
		}
		return {
			param : formParam,
			msg : msg,
			value : value
		};
	}
}));

//Passport config
require("./config/passport")(passport);
//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get("*", function(req, res, next) {
	res.locals.user = req.user || null;
	next();
});

//Home Route
//get action, use "/" means get action to the home page
app.get("/", function(req, res){
	Article.find({}, function(err, articles) {
		if(err) {
			console.log(err);
		}else {
			res.render("index", {
				title: "Articles",
				articles: articles
			});
		}
	});
});

//Route files
let articles = require("./routes/articles");
let users = require("./routes/users");
app.use("/articles", articles);
app.use("/users", users);



//Start Server
// app.listen(3000, function() {
// 	console.log("sever started on port 3000...");
// });

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});