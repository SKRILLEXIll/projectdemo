const User = require("../models/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const jwt_secret = process.env.JWT_SECRET;

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: "", password: "", secret: "" };
  //incorrecr mail
  if (err.message === "Incorrect secret") {
    errors.secret = "Incorrect secret";
  }
  if (err.message === "Incorrect email") {
    errors.email = "Incorrect email";
  }
  if (err.message === "Incorrect password") {
    errors.password = "Incorrect password";
  }
  if (err.code === 11000) {
    // duplicate email error
    errors.email = "that email is already registered";
    return errors;
  }

  // validation errors
  if (err.message.includes("user validation failed")) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, jwt_secret, {
    expiresIn: maxAge,
  });
};

// controller actions
module.exports.signup_get = (req, res) => {
  res.render("signup");
};

module.exports.login_get = (req, res) => {
  res.render("login");
};

module.exports.signup_post = async (req, res) => {
  let { firstname, lastname, email, password } = req.body;
  email = String(email);
  password = String(password);
  firstname = String(firstname);
  lastname = String(lastname);
  additionalinfo = {
    fullname: "",
    address: "",
    city: "",
    district: "",
    propertytype: null,
    adharcard: null,
    pancard: null,
  };
  // let finalres = mongoose.sanitizeFilter(
  //   JSON.stringify({ firstname, lastname, email, password })
  // );
  //console.log("here it is", finalres);
  try {
    role = "user";
    const user = await User.create({
      firstname,
      lastname,
      email,
      password,
      role,
      additionalinfo,
    });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.login_post = async (req, res) => {
  console.log("passed authController.js");
  //console.log(req);
  let { email, password } = req.body;
  email = String(email);
  password = String(password);
  try {
    const user = await User.login(email, String(password));
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};

module.exports.vendorlogin_get = (req, res) => {
  res.render("vendorlogin");
};
module.exports.vendorsignup_get = (req, res) => {
  res.render("vendorsignup");
};
module.exports.vendorlogin_post = async (req, res) => {
  let { email, password } = req.body;
  email = String(email);
  password = String(password);
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};
module.exports.vendorsignup_post = async (req, res) => {
  let { firstname, lastname, email, password } = req.body;
  email = String(email);
  password = String(password);
  firstname = String(firstname);
  lastname = String(lastname);
  additionalinfo = {
    fullname: "",
    address: "",
    city: "",
    district: "",
    propertytype: null,
    adharcard: null,
    pancard: null,
  };
  try {
    role = "vendor";
    const user = await User.create({
      firstname,
      lastname,
      email,
      password,
      role,
      additionalinfo,
    });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};
