const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function registerUser(req, res) {
  const {
    username,
    email,
    password,
    fullName: { firstName, lastName },
    addresses,
  } = req.body;

  const isUserAlreadyExist = await userModel.findOne({
    $or: [{ email }, { username }], // $or operator better to use here rather than two separate queries to check for email and username existence
  }); // so basically if someone exists with either the same email or username, we will consider that user already exists

  if (isUserAlreadyExist) {
    return res
      .status(409)
      .json({ message: "User with the same email or username already exists" });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    username,
    email,
    password: hash,
    fullName: {
      firstName,
      lastName,
    },
    addresses
  });

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true, // client side js cannot access the cookie, cookie will only be sent over HTTPS
    sameSite: "strict", // to prevent CSRF attacks
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.status(201).json({
    message: "User registered successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      addresses: user.addresses, // we can have multiple addresses for a user, so we will return an array of addresses
    },
  });
}

module.exports = { registerUser };
