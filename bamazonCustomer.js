var mysql = require("mysql");
var inquirer = require("inquirer")

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "cjbomb69",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  // console.log("connected as id " + connection.threadId);
  start()
});

function start() {
      connection.query("SELECT * FROM products", function (err, results) {
        console.log("\n\nPRODUCTS FOR SALE")
        for (var i = 0;i<results.length;i++) {
          console.log("\n---------------------------------------")
          console.log(results[i].item_id + ". " + results[i].product_name)
          console.log("Price: $" + results[i].price)
          console.log("Quantity: " + results[i].stock_quantity)
        }
        inquirer.prompt([
          {
            name: "choice",
            type: "rawlist",
            choices: function() {
              var choiceArray = [];
              for (var i = 0; i < results.length; i++) {
                choiceArray.push(results[i].product_name);
              }
              return choiceArray;
            },
            message: "What product would you like to buy?"
          },
          {
            name: "quantity",
            type: "input",
            message: "How much would you like to buy?",
            validate: function(value) {
              if (isNaN(value) === false) {
                return true;
              }
              return false;
            }
          }
        ]).then(function(answer) {
          var chosenItem;
          for (var i = 0; i < results.length; i++) {
            if (results[i].product_name === answer.choice) {
              chosenItem = results[i];
            }
          }
          if (chosenItem.stock_quantity < parseInt(answer.quantity)) {
            console.log("Insufficient Quantity!\n")
            playagain()
          } else {
            var newQuantity = (chosenItem.stock_quantity - parseInt(answer.quantity))
            var totalPrice = answer.quantity * chosenItem.price
            // console.log(newQuantity)
            connection.query("UPDATE products SET ? WHERE ?",
          [
            {
              stock_quantity: newQuantity
            },
            {
              product_name: chosenItem.product_name
            }
          ], function(err,res) {
            console.log("\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
            console.log("\nYou bought " + answer.quantity + " of " + chosenItem.product_name + " for $" + totalPrice + "\n")
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n")

          }
        )
        connection.query("UPDATE products SET ? WHERE ?",
      [
        {
          product_sales: chosenItem.product_sales + totalPrice
        },
        {
          product_name: chosenItem.product_name
        }
      ], function(err,res) {
            playagain()
          }
        )
      }
    })
  })
}

function playagain() {
  inquirer.prompt({
    name: "again",
    type: "rawlist",
    choices: ["Yes", "No"],
    message: "Would you like to buy another item?"
  }).then(function(playagain) {
    if (playagain.again === "Yes") {
      start()
    } else {
      connection.end()
    }
  })
}
