const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

router.post("/signup", (req, res, next) => {
  User.find({
      email: req.body.email
    })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          success: false,
          message: "Mail exists",
          data: {}
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash
            });
            user
              .save()
              .then(result => {
                console.log(result);
                res.status(201).json({
                  success: true,
                  message: "Successful user created",
                  data: result
                });
              })
              .catch(err => {
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    });
});

router.post("/login", (req, res, next) => {
  User.find({
      email: req.body.email
    })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          success: false,
          message: "Auth failed",
          data: {}
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            success: false,
            message: "Auth failed",
            data: {}
          });
        }
        if (result) {
          const token = jwt.sign({
              email: user[0].email,
              userId: user[0]._id
            },
            'secret', {
              expiresIn: "1h"
            }
          );
          var resObj = {};
          resObj.token = token;
          return res.status(200).json({
            success: true,
            message: "Auth successful",
            data: resObj
          });
        }
        res.status(401).json({
          success: false,
          message: "Auth failed",
          data: {}
        });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.delete("/:userId", (req, res, next) => {
  User.remove({
      _id: req.params.userId
    })
    .exec()
    .then(result => {
      res.status(200).json({
        success: true,
        message: "User deleted",
        data: {}
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;