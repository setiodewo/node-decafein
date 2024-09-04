# 04/09/2024

create database decafein;
create user decafein@localhost identified with caching_sha2_password by '5w4t1z3n2024!';

use decafein;

create user_level (
    id int primary key,
    name varchar(128)
);

insert into user_level values
(1, 'ADMIN'), (2, 'USER');

create table user(
    id int auto_increment primary key,
    name varchar(128),
    email varchar(256),
    phone varchar(128),
    pwd text,
    token text,
    active smallint default 1,
    createdAt datetime,
    index(name),
    index(email)
);

insert into user values
(1, 'Emanuel Setio Dewo', 'dewo@swatizen.com', '+6281932509003', MD5('5w4t1z3n2024!'), '', 1, now());

create table user_login (
    id bigint auto_increment primary key,
    userId int,
    token text,
    loginAt datetime,
    logoutAt datetime
);

create table cafe (
    id int auto_increment primary key,
    ownerId int,
    name varchar(128),
    address text,
    city varchar(128),
    province varchar(127),
    country varchar(128),
    zipCode varchar(64),
    active smallint default 1,
    createdBy int,
    createdAt datetime,
    index(ownerId),
    index(name),
    index(city),
    index(country),
    index(createdBy)
);

insert into cafe values
(1, 1, 'Swatizen Cafe', 'Jl. Hartono Raya', 'Tangerang', 'Banten', 'Indonesia', '15117', 1, 1, now());

create table user_cafe (
    id int auto_increment primary key,
    userId int,
    cafeId int,
    levelId smallint default 2,
    createdBy int,
    createdAt datetime,
    index(userId),
    index(cafeId),
    index(levelId),
    index(createdBy)
);

insert into user_cafe values
(1, 1, 1, 1, 1, now());

create table menu_type (
    id int auto_increment primary key,
    cafeId int,
    name varchar(128),
    icon varchar(128),
    active smallint default 1,
    createdBy int,
    createdAt datetime,
    index(cafeId),
    index(name),
    index(active),
    index(createdBy)
);

insert into menu_type values
(1, 1, 'Food', '', 1, 1, now()),
(2, 1, 'Beverage', '', 1, 1, now()),
(3, 1, 'Snack', '', 1, 1, now());

create table menu (
    id int auto_increment primary key,
    cafeId int,
    name varchar(128),
    typeId int,
    description text,
    currency varchar(5) default 'IDR',
    basePrice decimal(10,2) default 0,
    COGS decimal(10,2) default 0,
    active smallint default 1,
    createdBy int,
    createdAt datetime,
    index(cafeId),
    index(name),
    index(typeId),
    index(createdBy),
    index(createdAt)
);

insert into menu values
(1, 1, 'Hot Cappuccino', 2, 'Cappuccino Panas', 'IDR', 20000.0, 15000.0, 1, 1, now()),
(2, 1, 'Hot Espresso', 2, 'Espresso 150ml', 'IDR', 17500.0, 14000.0, 1, 1, now()),
(3, 1, 'Chocolate Croissant', 3, 'Chocolate Croissant', 'IDR', 15000.0, 12500.0, 1, 1, now());