const express = require("express");
const router = express.Router();
const { User, Validate } = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Joi = require("joi");
const auth = require("../middleware/auth");

function validateUser(user) {
  const schema = {
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string().required()
  };

  return Joi.validate(user, schema);
}

router.get("/", auth, async (req, res) => {
  const users = await User.find().select("-password -__v");
  res.send(users);
});

router.post("/login", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(400).send("Login Failed, invalid username or password");
    return;
  }
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    res.status(400).send("Login Failed, invalid username or password");
    return;
  }
  const token = user.generateAuthToken();
  res.send({ message: "Login Successful", token: token, user });
  // res.redirect("http://localhost:3000/register");
});

router.post("/register", async (req, res) => {
  const { error } = Validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let user = await User.findOne({ email: req.body.email });

  if (user)
    return res
      .status(400)
      .send(`This email ${req.body.email} is not available`);

  const isNameExist = await User.findOne({ name: req.body.name });
  if (isNameExist)
    return res.status(400).send(`This name ${req.body.name} is not available`);

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  const userToCreate = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword
  });

  try {
    const result = await userToCreate.save();
    if (result) {
      // res.send({ message: `User ${req.body.email} successfully created` });
      // let token = user.generateAuthToken();

      //Send the email
      let transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.GMAIL_USERNAME,
          pass: process.env.GMAIL_PASSWORD
        }
      });
      let mailOptions = {
        from: "aminuzack7@gmail.com",
        to: "zackaminu@yahoo.com",
        subject: "Account Verification Token",
        text: "Hello world"
      };
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
        }
        // console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      });

      // //Send the email
      // let transporter = nodemailer.createTransport({
      //   service: "Gmail",
      //   auth: {
      //     user: process.env.GMAIL_USERNAME,
      //     pass: process.env.GMAIL_PASSWORD
      //   }
      // });
      // let mailOptions = {
      //   from: "no-reply@yourwebapplication.com",
      //   to: userToCreate.email,
      //   subject: "Account Verification Token",
      //   text:
      //     "Hello,\n\n" +
      //     "Please verify your account by clicking the link: \nhttp://" +
      //     req.headers.host +
      //     "/confirmation/" +
      //     token.token +
      //     ".\n"
      // };
      // transporter.sendMail(mailOptions, function(err) {
      //   if (err) {
      //     return res.status(500).send(err.message);
      //   }
      //   res.status(200).send({
      //     message: `User ${req.body.email} successfully created`,
      //     email:
      //       "A verification email has been sent to " + userToCreate.email + "."
      //   });
      // });
    }
  } catch (error) {
    //res.send(error.message);
    console.log(error.message);
  }
});

router.get("/", (req, res) => {
  res.send("Hello user");
});

module.exports = router;
