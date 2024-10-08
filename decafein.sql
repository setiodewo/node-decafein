# 04/09/2024

SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));
SET PERSIST sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));

# brew services restart mysql


create database decafein;
create user decafein@localhost identified with caching_sha2_password by '5w4t1z3n2024!';
grant all privileges on *.* to decafein@localhost;
flush privileges;

use decafein;

create table user_level (
    id int primary key,
    name varchar(128)
);

insert into user_level values
(1, 'ADMIN'), (2, 'KASIR');

create table user(
    id int auto_increment primary key,
    userName varchar(128),
    name varchar(128),
    email varchar(256),
    phone varchar(128),
    pwd text,
    token text,
    active smallint default 1,
    createdBy int,
    createdAt datetime,
    index(userName),
    index(email)
);

insert into user values
(1, 'dewo', 'Emanuel Setio Dewo', 'dewo@swatizen.com', '+6281932509003', MD5('5w4t1z3n2024!'), '', 1, 1, now());

create table user_login (
    id bigint auto_increment primary key,
    userId int,
    cafeId varchar(16),
    token text,
    loginAt datetime,
    logoutAt datetime,
    index(userId),
    index(cafeId),
    index(loginAt)
);

create table cafe (
    id varchar(16) primary key,
    ownerId int,
    name varchar(128),
    address text,
    city varchar(128),
    province varchar(127),
    country varchar(128),
    zipCode varchar(64),
    lat varchar(128),
    lng varchar(128),
    url varchar(128),
    phone varchar(64),
    taxName varchar(128),
    tax decimal(10, 2),
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
('DECAFEIN', 1, 'Swatizen Cafe', 'Jl. Hartono Raya', 'Tangerang', 'Banten', 'Indonesia', '15117', '', '', 1, 1, now());

# untuk penambahan field2

alter table cafe add column url varchar(128) after lng;
alter table cafe add column phone varchar(64) after url;
alter table cafe add column taxName varchar(128) after phone, add column tax decimal(10, 2) after taxName;

create table user_cafe (
    id int auto_increment primary key,
    userId int,
    cafeId varchar(16),
    levelId smallint default 2,
    createdBy int,
    createdAt datetime,
    index(userId),
    index(cafeId),
    index(levelId),
    index(createdBy)
);

insert into user_cafe values
(1, 1, 'DECAFEIN', 1, 1, now());

create table menu_category (
    id int auto_increment primary key,
    cafeId varchar(16),
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

insert into menu_category values
(1, 'DECAFEIN', 'Food', '', 1, 1, now()),
(2, 'DECAFEIN', 'Beverage', '', 1, 1, now()),
(3, 'DECAFEIN', 'Snack', '', 1, 1, now());

create table menu (
    id int auto_increment primary key,
    cafeId varchar(16),
    name varchar(128),
    categoryId int,
    description text,
    currency varchar(5) default 'IDR',
    basePrice decimal(10,2) default 0,
    COGS decimal(10,2) default 0,
    active smallint default 1,
    createdBy int,
    createdAt datetime,
    index(cafeId),
    index(name),
    index(categoryId),
    index(createdBy),
    index(createdAt)
);

insert into menu values
(1, 'DECAFEIN', 'Hot Cappuccino', 2, 'Cappuccino Panas', 'IDR', 20000.0, 15000.0, 1, 1, now()),
(2, 'DECAFEIN', 'Hot Espresso', 2, 'Espresso 150ml', 'IDR', 17500.0, 14000.0, 1, 1, now()),
(3, 'DECAFEIN', 'Chocolate Croissant', 3, 'Chocolate Croissant', 'IDR', 15000.0, 12500.0, 1, 1, now());

create table sale_status (
    id int primary key,
    name varchar(64)
);

insert into sale_status values
(-1, 'DELETED'), (0, 'OPEN'), (1, 'PAID');

create table sale_type (
    id int primary key,
    name varchar(64)
);

insert into sale_type values
(1, 'Dine in'), (2, 'Take away'), (3, 'Delivery');

create table sale_hdr (
    id bigint auto_increment primary key,
    cafeId varchar(16),
    saleDate datetime,
    saleType smallint default 1,
    saleTo varchar(128),
    phoneNum varchar(64),
    tableId varchar(16),
    totalAmount decimal(10, 2),
    totalDiscount decimal(10, 2),
    totalTax decimal(10, 2),
    totalPaid decimal(10, 2),
    statusId smallint default 0,
    notes text,
    createdBy int,
    index(cafeId),
    index(saleDate),
    index(saleType),
    index(saleTo),
    index(phoneNum),
    index(tableId),
    index(statusId),
    index(createdBy)
);

create table sale_item (
    id bigint auto_increment primary key,
    saleId bigint,
    itemId int,
    categoryId int,
    currency varchar(16),
    basePrice decimal(10, 2),
    COGS decimal(10, 2),
    quantity int,
    discount int,
    amountDiscount decimal(10, 2),
    tax decimal(5, 2),
    amountTax decimal(10, 2),
    notes text,
    statusId smallint default 0,
    createdBy int,
    createdAt datetime,
    index(saleId),
    index(itemId),
    index(categoryId),
    index(createdBy)
);

select sum(quantity * basePrice) as totalAmount,
sum(quantity * (basePrice * discount / 100)) as totalDiscount
from sale_item
where saleId = 1;

create table payment_type(
    id int auto_increment primary key,
    name varchar(128),
    cafeId varchar(16),
    percent smallint default 0,
    paymentCharge decimal(10, 2) default 0,
    bankName varchar(128),
    bankAccount varchar(128),
    bankNum varchar(128),
    active smallint,
    index(cafeId),
    index(bankName),
    index(bankAccount),
    index(bankNum)
);
insert into payment_type values
(1, 'Tunai', 'DECAFEIN', 0, 0, '', '', '', 1),
(2, 'QRIS Statis', 'DECAFEIN', 1, 0.7, 'Bank Mandiri', 'Emanuel Setio Dewo', '123456789', 1),
(3, 'QRIS', 'DECAFEIN', 1, 0.7, 'Bank Mandiri', 'Emanuel Setio Dewo', '123456789', 1),
(4, 'Kartu Kredit BCA', 'DECAFEIN', 1, 3, 'Bank BCA', 'Emanuel Setio Dewo', '123456789', 1),
(5, 'Kartu Debit BCA', 'DECAFEIN', 1, 0, 'Bank BCA', 'Emanuel Setio Dewo', '123456789', 1);

create table sale_payment(
    id bigint auto_increment primary key,
    saleId bigint,
    cafeId varchar(16),
    payFor smallint,
    paymentType int,
    grandTotal decimal(10, 2),
    paymentCharge decimal(10, 2),
    payAmount decimal(10, 2),
    payChange decimal(10, 2),
    notes text,
    createdBy int,
    createdAt datetime,
    index(saleId),
    index(cafeId),
    index(paymentType),
    index(createdBy)
);

create table printer_type (
    id int primary key,
    name varchar(128)
);

insert into printer_type values
(1, 'Printer Thermal Kasir'),
(2, 'Printer Thermal Dapur'),
(3, 'Printer Thermal Kiosk');

create table printer(
    id bigint auto_increment primary key,
    cafeId varchar(16),
    name varchar(128),
    printerType smallint default 1,
    url text,
    token varchar(128),
    createdBy int,
    createdAt datetime,
    active smallint,
    index(cafeId),
    index(createdBy)
);

select date_format(h.saleDate, '%d') as x,
i.categoryId, i.itemId, c.name as categoryName,
sum(((i.basePrice * i.quantity) - amountDiscount - amountTax) - (i.COGS * i.quantity)) as PROFIT
from sale_hdr h
left outer join sale_item i on i.saleId = h.id
left outer join menu_category c on c.id = i.categoryId
where h.cafeId = 'DECAFEIN' and LEFT(h.saleDate, 7) = '2024-09' and h.statusId > 0
group by 1, 2;


create table space (
    id bigint auto_increment primary key,
    cafeId varchar(16),
    name varchar(128),
    floor int,
    rowNum int,
    colNum int,
    rowSize int,
    colSize int,
    leftright smallint,
    capacity int,
    description text,
    facility text,
    priceHourly decimal(10, 2),
    priceDaily decimal(10,2),
    priceMonthly decimal(10, 2),
    priceAnnually decimal(10, 2),
    createdBy int,
    createdAt datetime,
    active smallint,
    index(cafeId),
    index(rowNum),
    index(colNum)
);

create table sale_space (
    id bigint auto_increment primary key,
    cafeId varchar(16),
    customerId int,
    rentType smallint default 1,
    saleDate datetime,
    startDate datetime,
    endDate datetime,
    spaceId int,
    currency varchar(16) default 'IDR',
    quantity int,
    basePrice decimal(10, 2),
    discount int,
    amountDiscount decimal(10, 2),
    tax decimal(5, 2),
    amountTax decimal(10, 2),
    total decimal(10, 2),
    notes text,
    statusId smallint default 0,
    createdBy int,
    createdAt datetime,
    index(cafeId),
    index(customerId),
    index(rentType),
    index(saleDate),
    index(startDate),
    index(endDate),
    index(spaceId),
    index(statusId),
    index(createdBy)
);

# contoh data
insert into sale_space values
(1, 'DECAFEIN', 1, 2, now(), now(), DATE_ADD(now(), INTERVAL 1 DAY), 1, 'IDR', 100000,
0, 0, 0, 0, 1, 100000, '', 0, 1, now());

create table rent_type (
    id int primary key,
    name varchar(32),
    addition text
);

insert into rent_type values
(1, 'Per Jam', 'INTERVAL 1 HOUR'),
(2, 'Per Hari', 'INTERVAL 1 DAY'),
(3, 'Per Bulan', 'INTERVAL 30 DAY'),
(4, 'Per Tahun', 'INTERVAL 1 YEAR');


select now() as startDate, concat(left(date_add(now(), interval 2 day), 10), ' 18:00:00') as endDate;