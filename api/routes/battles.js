const express = require("express");
const router = express.Router();
const _ = require("lodash");
const mongoose = require("mongoose");
const checkAuth = require('../middleware/check-auth');

const Battle = require("../models/battle");

// Handle incoming GET requests to /battles

// API to get all battles
router.get("/", checkAuth, (req, res, next) => {

  Battle.find({}, {})
    .then(battles => {
      if (!battles) {
        return res.status(404).json({
          message: "Battle not found"
        });
      }
      res.status(200).json({
        sucess: true,
        message: "Successfully returns battles",
        data: battles
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

// API to get returns list(array) of all the places where battle has taken place.
router.get("/list", checkAuth, (req, res, next) => {

  Battle.find({}, {
      _id: 0,
      location: 1,
    })
    .then(locations => {
      if (!locations) {
        return res.status(404).json({
          message: "Battle not found"
        });
      }
      res.status(200).json({
        sucess: true,
        message: "Successfully returns list of locations where battles have taken place",
        data: locations
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

// API returns total number of battle occurred.
router.get("/count", checkAuth, (req, res, next) => {

  Battle.find()
    .then(battles => {
      if (!battles) {
        return res.status(404).json({
          message: "Battle not found"
        });
      }
      const responseToDisplay = JSON.parse(JSON.stringify(battles));
      const responseToDisplayLength = responseToDisplay.length;
      res.status(200).json({
        sucess: true,
        message: "Successfully return total number of battle occurred",
        data: responseToDisplayLength
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});


// API to get stats
router.get("/stats", checkAuth, (req, res, next) => {

  Battle.find()
    .then(battles => {

      if (!battles) {
        return res.status(404).json({
          message: "Battle not found"
        });
      }
      const battleList = JSON.parse(JSON.stringify(battles));
      const resObj = {};
      resObj.most_active = {};

      const counts = {};
      let compare = 0;
      let mostFrequentValue;

      function mostFrequent(array) {
        const valueToStore = array;
        for (let i = 0, len = array.length; i < len; i++) {
          const word = array[i];

          if (counts[word] === undefined) {
            counts[word] = 1;
          } else {
            counts[word] = counts[word] + 1;
          }
          if (counts[word] > compare) {
            compare = counts[word];
            mostFrequentValue = valueToStore[i];
          }
        }
        return mostFrequentValue;
      }

      const attacker_king = _.map(battleList, 'attacker_king');
      const defender_king = _.map(battleList, 'defender_king');
      resObj.most_active.attacker_king = mostFrequent(attacker_king);
      resObj.most_active.defender_king = mostFrequent(defender_king);
      resObj.region = '';
      resObj.name = '';

      resObj.attacker_outcome = {};

      const totalWin = _.filter(battleList, {
        attacker_king: resObj.most_active.attacker_king,
        attacker_outcome: 'win',
      });

      const totalLoss = _.filter(battleList, {
        attacker_king: resObj.most_active.attacker_king,
        attacker_outcome: 'loss',
      });

      const defender_king_array = _.filter(battleList, {
        defender_king: resObj.most_active.defender_king,
      });

      const defender_size_array = _.map(defender_king_array, 'defender_size');
      const battle_type_list = _.map(battleList, 'battle_type');

      resObj.attacker_outcome.win = totalWin.length; // total win
      resObj.attacker_outcome.loss = totalLoss.length; // total loss
      resObj.battle_type = _.uniq(battle_type_list); // unique battle types

      resObj.defender_size = {};
      resObj.defender_size.average = _.sum(defender_size_array) / defender_size_array.length;
      resObj.defender_size.min = _.min(defender_size_array);
      resObj.defender_size.max = _.max(defender_size_array);

      const responseToDisplay = JSON.parse(JSON.stringify(resObj));

      res.status(200).json({
        "Total number of battle occurred": responseToDisplay,
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

// API for search
router.get("/search", checkAuth, (req, res, next) => {

  var getQueryObject = function() {
    let reqParameters = {};
    let re = /[?&]([^=&]+)(=?)([^&]*)/g;
    while (m = re.exec(req.originalUrl))
      reqParameters[decodeURIComponent(m[1])] = (m[2] == '=' ? decodeURIComponent(m[3]) : true);
    return reqParameters;
  }

  var QueryString = getQueryObject();
  var whereFilter = {};

  for (let key in QueryString) {
    if (QueryString.hasOwnProperty(key)) {
      let val = QueryString[key];
      if (key === 'king') {
        whereFilter.$or = [];
        whereFilter.$or.push({
          'attacker_king': val
        });
        whereFilter.$or.push({
          'defender_king': val
        });
      } else if (key === 'type') {
        whereFilter['battle_type'] = val;
      } else {
        whereFilter[key] = val;
      }
    }
  }

  Battle.find(whereFilter, {})
    .then(searchBattles => {
      if (!searchBattles) {
        return res.status(404).json({
          message: "Battle not found"
        });
      }
      res.status(200).json({
        sucess: true,
        message: "Successfully return battles search result",
        data: searchBattles
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;