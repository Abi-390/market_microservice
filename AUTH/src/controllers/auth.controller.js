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
    sameSite: "strict", // to prevent CSRF attacks , CSRF attacks are basically when an attacker tricks a user into making a request to a different website where the user is authenticated, by setting sameSite to strict, the cookie will only be sent for requests originating from the same site, so if an attacker tries to make a request from a different site, the cookie will not be sent and the request will be rejected by the server
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

async function loginUser(req,res){
   const { email, password } = req.body;

   const user = await userModel.findOne({ email });
   console.log(user);

   if (!user) {
     return res.status(404).json({ message: "User not found" });
   }

   // console.log(password);
   //console.log(user.password)

   const isMatch = await bcrypt.compare(password, user.password);
   

   if (!isMatch) {
     return res.status(401).json({ message: "Invalid credentials" });
   }

   const token = jwt.sign(
     {
       id: user._id,},
       process.env.JWT_SECRET,
       { expiresIn: "1d" },
     );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        addresses: user.addresses,
      },
    });
  }

module.exports = { registerUser, loginUser };
