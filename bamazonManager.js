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
  // connection.end();
});

function start() {
  inquirer.prompt({
    name: "choice",
    type: "rawlist",
    choices: ["View Products for sale", "View Low Inventory", "Add to Inventory", "Add new Product"],
    message: "What would you like to do?"
  }).then(function(answer){
    if(answer.choice === "View Products for sale") {
      productsForSale()
    } else if (answer.choice === "View Low Inventory") {
      lowInventory()
    } else if (answer.choice === "Add to Inventory") {
      addInv()
    } else if (answer.choice === "Add new Product") {
      addProduct()
    }
  })
}

function productsForSale() {
  connection.query("SELECT * FROM products", function (err, results) {
    for(i=0;i<results.length;i++) {
      console.log("\n---------------------------------------")
      console.log(results[i].item_id + ". " + results[i].product_name)
      console.log("Price: $" + results[i].price)
      console.log("Quantity: " + results[i].stock_quantity)
    }
    console.log("\n")
    reset()
  })
}

function lowInventory() {
  connection.query("SELECT * FROM products", function (err, results) {
    for(i=0;i<results.length;i++) {
      if (results[i].stock_quantity < 5) {
        console.log("\n" + results[i].product_name)
        console.log("Quantity: " + results[i].stock_quantity)
      }
    }
    console.log("\n")
    reset()
  })
}

function addInv() {
  connection.query("SELECT * FROM products", function (err, results) {
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
      message: "What item would you like to add inventory to?"
    },
    {
      name: "add",
      type: "input",
      validate: function(value) {
      if (isNaN(value) === false) {
        return true;
      }
      return false;
    },
      message: "How much inventory would you like to add?"
    }
  ]).then(function(answer){
      var chosenItem;
      for(i=0;i<results.length;i++){
        if(results[i].product_name === answer.choice) {
          chosenItem = results[i]
        }
      }
      var newStock = (chosenItem.stock_quantity + parseInt(answer.add))
      connection.query("UPDATE products SET ? WHERE ?",
    [
      {
        stock_quantity: newStock
      },
      {
        product_name: chosenItem.product_name
      }
    ], function(err,res) {
          console.log(chosenItem.product_name + " inventory is updated!\n");
          reset()
        }
      )
    })
  })
}

function addProduct() {
  inquirer.prompt([
  {
    name: "product",
    type: "input",
    message: "What product would you like to add?"
  },
  {
    name: "price",
    type: "input",
    message: "How much would you like to set the price?"
  },
  {
    name: "quantity",
    type: "input",
    message: "How much inventory is there?"
  },
  {
    name: "department",
    type: "input",
    message: "What department is this product in?"
  }
  ]).then(function(answer){
    connection.query("INSERT INTO products SET ?",
    {
      product_name: answer.product,
      department_name: answer.department,
      price: answer.price,
      stock_quantity: answer.quantity
    }, function(err,res) {
        console.log(answer.product + " added!")
        reset()
      }
    )
  })
}

function reset() {
  inquirer.prompt({
    name: "reset",
    type: "rawlist",
    choices: ["Yes","No"],
    message: "Would you like to do something else?"
  }).then(function(answer){
    if(answer.reset === "Yes") {
      start()
    } else {
      connection.end()
    }
  })
}
