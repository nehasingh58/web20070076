const path = require("path");
const router = require("express").Router();
const fs = require("fs");
var request = require("request");
var azure = require("azure-storage");
var tableService = azure.createTableService(
  "ne20070076",
  "3Q9bwDZLUAOYU7lv3e81FJXhqHSkacTqJ8LIAPBi8vRPHF4t3VHnUW2ILc6ofn2X3nbJG9NwZRn2XweqhkkPqw=="
);

router.get("/getData", (req, res) => {
  var d = new Date();
  console.log(d);
  var n = d.valueOf();

  let lasttime = n - 5000;

  var query = new azure.TableQuery()
    .top(1)
    .where("Timestamp ge ?", new Date(lasttime));

  tableService.queryEntities("LiveData20070076", query, null, function (
    error,
    result,
    response
  ) {
    if (!error) {
      console.log(result.entries, n);

      let entries = result.entries;

      if (entries.length == 0) {
        res.status(200).send({
          status: 200,
          temparature: 0,
          humidity: 0,
        });
      } else {
        res.status(200).send({
          status: 200,
          temparature: entries[0].temperature._,
          humidity: entries[0].humidity._,
        });
      }
    } else {
      console.log(error);

      res.status(500).send({
        status: 500,
        error: error.toString(),
      });
    }
  });
});

router.get("/history", (req, res) => {
  let from = req.query.from;
  let to = req.query.to;
  if (from == null || from == undefined || to == null || to == undefined) {
    res.status(500).send({
      status: 500,
      error: "bad input",
    });
  } else {
    var query = new azure.TableQuery().where(
      "Timestamp ge datetime'" +
        from +
        "' and Timestamp lt datetime'" +
        to +
        "'"
    );
    tableService.queryEntities("LiveData20070076", query, null, function (
      error,
      result,
      response
    ) {
      if (!error) {
        let entries = result.entries;
        if (entries.length == 0) {
          res.status(200).send({
            status: 200,
            temparature: 0,
            humidity: 0,
          });
        } else {
          let tempArray = [];
          let humArray = [];
          for (i = 0; i < entries.length; i++) {
            tempArray.push({
              label: new Date(parseInt(entries[i].time._)),
              y: entries[i].temperature._,
            });      
            
            humArray.push({
              label: new Date(parseInt(entries[i].time._)),
              y: entries[i].humidity._,
            });      
          }
          res.status(200).send({
            status: 200,
            temparature: tempArray,
            humidity: humArray
          });
        }
      } else {
        console.log(error);
        res.status(500).send({
          status: 500,
          error: error.toString(),
        });
      }
    });
  }
});

module.exports = router;
