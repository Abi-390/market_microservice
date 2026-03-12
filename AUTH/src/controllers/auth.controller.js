const userModel = require("../models/user.model");

async function registerUser(req, res) { // Extract user data from request body
  const {
    username,
    email,
    password,
    fullName: { firstName, lastName },
  } = req.body;
}
