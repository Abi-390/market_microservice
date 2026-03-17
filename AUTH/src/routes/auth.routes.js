const express = require("express");
const validators = require('../middlewares/validator.middleware')
const authController = require('../controllers/auth.controller')
const authMiddleware =  require('../middlewares/auth.middleware')



const router = express.Router();


router.post("/register", validators.registerUserValidations, authController.registerUser);
router.post("/login", validators.loginUserValidations, authController.loginUser);
router.get("/me",authMiddleware, authController.currentUser);

module.exports = router;
