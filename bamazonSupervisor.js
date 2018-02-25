var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

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
  inquirer.prompt({
      name: "choice",
      type: "rawlist",
      choices: ["View Product Sales by Department", "Create new department"],
      message: "What would you like to do?"
    }).then(function(answer){
      switch (answer.choice) {

        case "View Product Sales by Department":
          view();
          break;

        case "Create new department":
          create();
          break;
    }
  })
}

function view() {
  var query = "SELECT departments.department_id, departments.department_name, departments.over_head_costs, products.product_sales, SUM(products.product_sales) AS productsales";
  query += " FROM  products INNER JOIN departments ON (departments.department_name = products.department_name) GROUP BY products.department_name";

  connection.query(query, function(err, res) {
    for(i=0;i<res.length;i++) {
      var total = res[i].productsales - res[i].over_head_costs
      console.log("Department Name: " + res[i].department_name + " | " + "Over head costs: " + res[i].over_head_costs + " | " + "Products Sales: " + res[i].productsales + " | " + "Total Profit: " + total)
    }
    playagain()
  })
}

function create() {
  inquirer.prompt([
    {
      name: "name",
      type: "input",
      message: "What is the department name?"
    },
    {
      name: "cost",
      type: "input",
      message: "What is the over head cost?",
      validate: function(value) {
        if (isNaN(value) === false) {
          return true;
        }
        return false;
      }
    }
  ]).then(function(answer){
    connection.query(
    "INSERT INTO departments SET ?",
    {
      department_name: answer.name,
      over_head_costs: answer.cost
    },
    function(err, res) {
      console.log("Department Added!\n");
      playagain()
      }
    );
  })
}

function playagain() {
  inquirer.prompt({
    name: "again",
    type: "rawlist",
    choices: ["Yes", "No"],
    message: "Would you like to do something else?"
  }).then(function(playagain) {
    if (playagain.again === "Yes") {
      start()
    } else {
      connection.end()
    }
  })
}
