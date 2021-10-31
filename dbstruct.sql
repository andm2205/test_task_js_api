drop database test_task_db;

create database test_task_db;

use test_task_db;

create table users (
	id int unsigned primary key auto_increment,
    name varchar(255) not null,
    password varchar(255) not null
);

create table products (
	id int unsigned primary key auto_increment,
    name varchar(255) not null,
    price decimal(10, 2) not null,
    check (price >= 0),
    user_id int unsigned not null,
    status_code tinyint unsigned not null,
    foreign key (user_id)
    references users (id)
);

insert into users (name, password) values 
('ivan', 'k2BnGaNem62zmgds'),
('andrey', 'UPnhu3mGjqTB6qa7');