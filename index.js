const inquirer = require('inquirer');
const consTable = require('console.table');
const db = require('./db/connection');



const companyMenu = function () {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What action would you like to take?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update an employee role',
                'Exit'
            ]
        }
    ]).then(({ action }) => {
        console.log(action);
        switch (action) {
            case "View all departments":
                viewDepartments();
                break;
            case "View all roles":
                viewRoles();
                break;
            case "View all employees":
                viewEmployees();
                break;
            case "Add a department":
                addDepartment();
                break;
            case "Add a role":
                addRole();
                break;
            case "Add an employee":
                addEmployee();
                break;
            case "Update an employee role":
                updateEmployeeRole();
                break;
            case "Exit":
                console.log("Goodbye");
                db.end();
                break;
        }
    });
}



//view all departments
function viewDepartments() {
    db.promise()
        .query(`SELECT * FROM department`)
        .then((data) => {
            const [rows] = data;
            console.log("/n");
            console.table('Departments', rows);
            companyMenu(); 
        });
};

// view all roles
function viewRoles() {
    db.promise()
        .query(`SELECT role.id, role.title, role.salary, department.name AS department FROM role
        LEFT JOIN department ON (department.id = role.department_id)
        ORDER BY role.id;`)
        .then((data) => {
            const [rows] = data;
            console.log("\n");
            console.table('Roles', rows);
            companyMenu();
        });
}

// view all employees
function viewEmployees() {
    db.promise()
        .query(
            `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
        FROM employee
        LEFT JOIN employee manager on manager.id = employee.manager_id
        INNER JOIN role ON (role.id = employee.role_id)
        INNER JOIN department ON (department.id = role.department_id)
        ORDER BY employee.id;`
        )
        .then((data) => {
            const [rows] = data;
            console.log("\n");
            console.table('Employees', rows);
            companyMenu();
        });
}

// add a department
function addDepartment() {
    inquirer
        .prompt({
            type: "input",
            message: "Enter new department name:",
            name: "new_department",
        })
        .then(function (answer) {
            db.query(
                `INSERT INTO department SET ?`,
                {
                    name: answer.new_department,
                },
                function (err, answer) {
                    if (err) {
                        throw err;
                    }
                }
            ),
                console.log("New department has been added to the database.");
            console.log("\n");
            console.table('New department', answer);
            companyMenu();
        });
}

// add a role
addRole = () => {
    inquirer
        .prompt([
            {
                type: "input",
                message: "Enter new role name:",
                name: "new_role"
            },
            {
                type: "number",
                message: "New role salary:",
                name: "new_salary"
            }
        ])
        .then(answer => {
            const params = [answer.new_role, answer.new_salary];
            const roleQuery = `SELECT name, id FROM department`;
            db.query(roleQuery, (err, data) => {
                if (err) throw err;
                const depts = data.map(({ name, id }) => ({ name: name, value: id }));
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'new_dept',
                        message: "New role department:",
                        choices: depts
                    }
                ])
                    .then(deptChoice => {
                        const department = deptChoice.new_dept;
                        params.push(department);
                        console.log(params);
                        const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
                        db.query(sql, params, (err, result) => {
                            if (err) throw err;
                            console.log("\nNew role " + answer.new_role + " has been added to the database.\n");
                            companyMenu();
                        })
                    })
            })
        })
};

// add an employee
function addEmployee() {
    db.query("SELECT * FROM role", (err, result) => {
        if (err) throw err;
        const roles = result.map((role) => ({
            value: role.id,
            name: role.title,
        }));
        db.query("SELECT * FROM employee", (err, result) => {
            if (err) throw err;
            const managers = result.map((employee) => ({
                value: employee.id,
                name: employee.first_name + " " + employee.last_name,
            }));
            managers.push({ name: "None", value: null });
            inquirer
                .prompt([
                    {
                        type: "input",
                        message: "New employee first name:",
                        name: 'first_name',
                    },
                    {
                        type: "input",
                        message: "New employee last name:",
                        name: 'last_name'
                    },
                    {
                        type: "list",
                        message: "New employee role:",
                        name: "role_id",
                        choices: roles
                    },
                    {
                        type: "list",
                        message: "New employee manager:",
                        name: "manager_id",
                        choices: managers,
                    }
                ]
                )
                .then(function (answer) {
                    db.query(
                        "INSERT INTO employee SET ?",
                        answer,
                        function (err, result) {
                            if (err) {
                                throw err;
                            }
                            console.log("\nNew employee " + answer.first_name + " " + answer.last_name + "has been added to database.\n");
                            companyMenu();
                        }
                    );
                });
        });
    })
};

//update employee role
function updateEmployeeRole() {
    db.query("SELECT * FROM employee", (err, result) => {
        if (err) throw err;
        const employees = result.map((employee) => ({
            value: employee.id,
            name: employee.first_name + " " + employee.last_name,
        }));
        db.query("SELECT * FROM role", (err, result) => {
            if (err) throw err;
            const roles = result.map((role) => ({
                value: role.id,
                name: role.title,
            }));
            inquirer
                .prompt([
                    {
                        type: "list",
                        message: "Which employee are you updating?",
                        name: 'id',
                        choices: employees
                    },
                    {
                        type: "list",
                        message: "Employee's new role:",
                        name: 'role_id',
                        choices: roles
                    }
                ]
                )
                .then(function (answer) {
                    db.query(
                        "UPDATE employee SET role_id = ? WHERE id = ?", [answer.role_id, answer.id],
                        function (err, result) {
                            if (err) {
                                throw err;
                            }
                            console.log("\nEmployee role updated");
                            companyMenu();
                        }
                    );
                });
        });
    });
};



module.exports = { companyMenu };