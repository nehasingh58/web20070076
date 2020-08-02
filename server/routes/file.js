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

module.exports = router;
