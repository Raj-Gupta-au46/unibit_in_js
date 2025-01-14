const validation = require("../validator/validation.js");
const authors = require("../models/user.model.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

let { isValidName, isValidEmail, isValidPassword, isEmpty } = validation; //Destructuring

const createUser = async function (req, res) {
  // Checking body is empty or not
  try {
    let data = req.body;
    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: false, message: "Body is empty" });
    }

    let { name, title, email, password, houseNo } = data; //Destructuring

    if (!name || !title || !email || !password) {
      return res
        .status(400)
        .send({ status: false, message: "all fields must be required" });
    }

    /*------------------------Checking attributes are empty or not-----------------------------------*/

    if (!isEmpty(name)) {
      return res
        .status(400)
        .send({ status: false, message: "First Name is required" });
    }

    if (!isEmpty(title)) {
      return res
        .status(400)
        .send({ status: false, message: "title  is required" });
    }
    if (!isEmpty(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Email is required" });
    }
    if (!isEmpty(password)) {
      return res
        .status(400)
        .send({ status: false, message: "password is required" });
    }

    /*-----------------------------------Checking Valid Title or Not------------------------------------------------*/

    // if (title != "Mr" && title != "Mrs" && title != "Miss") {
    //   return res.status(400).send({ msg: "Not have appropiate title" });
    // }

    // if (!isValidName(name)) {
    //   // Name validation
    //   return res.status(400).send({ status: false, message: "name is Wrong" });
    // }

    // if (!isValidEmail(email)) {
    //   // Email validation
    //   return res
    //     .status(400)
    //     .send({ status: false, message: "Please provide valid Email" });
    // }

    // if (!isValidPassword(password)) {
    //   // Password validation
    //   return res.status(400).send({
    //     status: false,
    //     message:
    //       "Your password must have 8 characters, contain at least one number or symbol, and have a mixture of uppercase and lowercase letters.",
    //   });
    // }
    /**----------------------------------hash password------------------------------------------- */

    const hashedPassword = await bcrypt.hash(password, 10);

    /*-----------------------------------CREATING AUTHOR-----------------------------------------------------*/

    let userCreate = await authors.create({
      name,
      title,
      email,
      password: hashedPassword,
      address: {
        houseNo,
      },
    });
    res.status(201).send({ status: true, data: userCreate });
  } catch (error) {
    res.status(500).send({ status: true, message: error.message });
  }
};

/* --------------------------------------------------AUTHOR-LOGIN---------------------------------------------- */

const loginUser = async function (req, res) {
  try {
    let name = req.body.username;
    let password = req.body.password;

    let author = await authors.findOne({ name });
    if (!author) {
      return res
        .status(401)
        .json({ message: "Username or password is not correct" });
    }

    // compare the password
    const isPasswordValid = await bcrypt.compare(password, author.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // here we are creating the JSON WEB TOKEN (JWT)
    const token = jwt.sign({ userId: author._id }, process.env.SECRET_KEY);

    res.status(200).json({ token, name, author });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

const updateuser = async function (req, res) {
  try {
    const id = req?.params?.userId;
    const data = req?.body;

    // Perform the update without checking for duplicate email
    const userUpdate = await authors.findByIdAndUpdate(
      { _id: id }, // Filter by _id
      data, // Update data
      { new: true } // Return the updated document
    );

    if (!userUpdate) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    res.status(200).json({ status: true, data: userUpdate });
  } catch (error) {
    console.log(error, "error");
    res.status(500).json({ status: false, message: error.message });
  }
};

module.exports.createUser = createUser;

module.exports.loginUser = loginUser;

module.exports.updateuser = updateuser;
