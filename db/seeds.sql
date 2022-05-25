INSERT INTO department
    (name)
VALUES
('Sales'),
('Engineering'),
('Finance'),
('Legal');

INSERT INTO role
    (title, salary, department_id)
VALUES
('Sales Lead', 100000, 1),
('Salesperson', 80000, 1),
('Lead Engineer', 150000, 2),
('Software Engineer', 120000, 2),
('Accountant', 125000, 3),
('Legal Team Lead', 250000, 4),
('Lawyer', 190000,2);

INSERT INTO Employee (first_name, last_name, role_id, manager_id)
VALUES
('Diana', 'Cady', 3, null),
('Javier', 'Molano', 5, null),
('Sofia', 'Smith', 6, null),
('Camila', 'Cook', 3, null),
('Richard', 'Scott', 1, 1),
('Jennifer', 'Hernandez', 2, 1), 
('Mo', 'Berry', 4, 1),
('Gwen', 'Barker', 7, 3);