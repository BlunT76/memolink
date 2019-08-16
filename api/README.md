# MemoLinks API

## IMPORTANT !!! RENAME api_example.php TO api.php

Needs MySQL or MariaDB
Create the database with schema.sql

You need to edit this 3 lines api.php
// connect to the mysql database
$db = mysqli_connect('localhost', 'username', 'password', 'table');

// JWT secret
define('JWT_SECRET', 'choose a secret phrase');

// Authorized client needed for cors
$client = 'http://localhost:3000';
