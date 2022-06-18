var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const hbs = require("express-handlebars");
const db = require("./config/dataBaseConnection");
const SESSION = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(SESSION);
const fileUplaod = require("express-fileupload");
require("dotenv").config();

db.connect((err) => {
  if (err) {
    console.log("Data base connection error" + err);
  } else {
    console.log(`Database connection successful`);
  }
});

const store = new MongoDBStore({
  uri: process.env.Session_store,
  collection: "mySessions",
});
store.on("error", function (error) {
  console.log("error");
});

var usersRouter = require("./routes/users");
var vendorRouter = require("./routes/vendor");
var adminRouter = require("./routes/admin");
var otpRouter = require("./routes/otp");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.engine(
  "hbs",
  hbs({
    extname: "hbs",
    defaultLayout: "main",
    layoutsDir: __dirname + "/views/layout",
    partialsDir: __dirname + "/views/partials",
  })
);

// session
app.use(
  SESSION({
    secret: "123",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
    store: store,
  })
);

// fileUpload
app.use(fileUplaod());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", usersRouter);
app.use("/vendor", vendorRouter);
app.use("/admin", adminRouter);
app.use("/otp", otpRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
