const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
var csrf = require("csurf");
var csrfProtection = csrf({ cookie: true });

const {
  requireAuth,
  checkUser,
  displayallusers,
  deleteUser,
  searchuser,
  isAdmin,
} = require("./middleware/authMiddleware");
const mongoSantize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const app = express();

// middleware
app.disable("x-powered-by");
app.use(express.static("public"));
app.use(mongoSantize());
app.use(xss());
app.use(express.json());
app.use(cookieParser());

//handling wrong invlid json syntax
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    //console.error(err);
    return res.status(400).send("Invalid Json formatting"); // Bad request
  }
});

// view engine
app.set("view engine", "ejs");

// database connection
const mongoUsername = process.env.MONGO_USERNAME;
const mongoPassword = process.env.MONGO_PASSWORD;
const dbURI =
  "mongodb+srv://" +
  mongoUsername +
  ":" +
  mongoPassword +
  "@nodepractice.l9viu.mongodb.net/real-auth?retryWrites=true&w=majority";
mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));

// routes
app.get("*", checkUser);
app.get("/add", csrfProtection, (req, res) => {
  console.log("zeeeeeeeee");
  console.log(req.csrfToken());
  res.render("additional-user-info", { csrfToken: req.csrfToken() });
});
app.get("/", (req, res) => res.render("home"));
app.get("/smoothies", requireAuth, (req, res) => res.render("smoothies"));

app.use(authRoutes);
