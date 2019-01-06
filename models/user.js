const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 5, maxlength: 10 },
  email: {
    type: String,
    unique: true,
    minlength: 5,
    maxlength: 255,
    required: true
  },
  password: { type: String, required: true, minlength: 7, maxlength: 1024 },
  isVerified: { type: Boolean, default: false }
});

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    { _id: this._id, name: this.name, email: this.email },
    config.get("jwtPrivateKey"), {expiresIn: '24h'}
  );
  return token;
};

const User = mongoose.model("users", userSchema);

function validateUser(user) {
  const schema = {
    name: Joi.string()
      .min(5)
      .max(10)
      .required(),
    email: Joi.string()
      .email()
      .required()
      .min(5)
      .max(255),
    password: Joi.string()
      .min(7)
      .max(255)
      .required()
  };

  return Joi.validate(user, schema);
}

exports.User = User;
exports.Validate = validateUser;
