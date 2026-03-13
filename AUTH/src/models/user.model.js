const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zip: String,
  country: String,
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    select : false, // so that when we query for user, password will not be included in the result(frontend) by default, we can explicitly include it when needed using .select('+password') in our queries
  },

  fullName: {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
  },

  role: {
    type: String,
    enum: ["user", "seller"],
    default: "user",
  },

  addresses: [addressSchema],
});

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;