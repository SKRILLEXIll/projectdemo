const jwt = require("jsonwebtoken");
const User = require("../models/User");
const jwt_secret = process.env.JWT_SECRET;

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  //check json web token exists
  if (token) {
    jwt.verify(token, jwt_secret, (err, decodedtoken) => {
      if (err) {
        console.log(err.message);
        res.redirect("/login");
      } else {
        //console.log(decodedtoken);
        next();
      }
    });
  } else {
    res.redirect("/login");
  }
};

const checkUser = (req, res, next) => {
  //console.log(res.csrfToken());
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwt_secret, async (err, decodedtoken) => {
      if (err) {
        console.log(err.message);
        res.locals.user = null;
        next();
      } else {
        console.log(decodedtoken);
        let user = await User.findById(decodedtoken.id);
        res.locals.user = user;
        if (
          (user.additionalinfo.fullname == "") |
          (user.additionalinfo.address == "") |
          (user.additionalinfo.city == "") |
          (user.additionalinfo.district == "") |
          (user.additionalinfo.propertytype == "") |
          (user.additionalinfo.adharcard == "") |
          (user.additionalinfo.pancard == "")
        ) {
          return res.render("additional-user-info");
        }
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

const isAdmin = (req, res, next) => {
  const token = req.cookies.jwt;
  //check json web token exists
  if (token) {
    jwt.verify(token, jwt_secret, async (err, decodedtoken) => {
      if (err) {
        console.log(err.message);
        res.redirect("/login");
      } else {
        console.log(decodedtoken.id);
        let user = await User.findById(decodedtoken.id);
        if (user.role == "admin") {
          //res.send(user.role);
          next();
        } else {
          res.send("u are not admin");
        }

        //next();
      }
    });
  } else {
    res.redirect("/login");
  }
};

const displayallusers = async (req, res, next) => {
  //console.log(decodedtoken);
  let user = await User.find();
  res.locals.alluser = user;
  next();
};
const deleteUser = async (req, res, next) => {
  //res.send(req.body);
  let userInfo = await User.findOne(req.body);

  let user = await User.findByIdAndDelete(userInfo._id);
  // res.locals.alluser = user;
  //res.redirect(req.get("referer"));
  //res.redirect("/admin");
  //next();
};
const searchuser = async (req, res, next) => {
  //console.log(decodedtoken);
  let user = await User.find({ email: req.query.email.trim() });
  res.locals.searcheduser = user;
  next();
};
module.exports = {
  requireAuth,
  checkUser,
  displayallusers,
  deleteUser,
  searchuser,
  isAdmin,
};
