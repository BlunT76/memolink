<?php
require_once './vendor/autoload.php';
use Firebase\JWT\JWT;

/* ----------CONFIG---------- */

// !!! IMPORTANT !!! RENAME THIS FILE TO api.php  !!! IMPORTANT !!!

// connect to the mysql database
$db = mysqli_connect('localhost', 'username', 'password', 'table');

mysqli_set_charset($db, 'utf8');

// JWT secret
define('JWT_SECRET', 'choose a secret phrase');

// Authorized client needed for cors
$client = 'http://localhost:3000';

// Forbidden tables
$forbiddenTables = ['users'];


/* ----------END CONFIG---------- */

// get the HTTP method, path and body of the request
$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'], '/'));
$input = json_decode(file_get_contents('php://input'), true);

// retrieve the table and key from the path
$table = preg_replace('/[^a-z0-9_]+/i', '', array_shift($request));
$key = array_shift($request)+0;

if (in_array($table, $forbiddenTables)) {
    $res = array(
        'code' => 403,
        'status' => 'error',
        'message' => 'Forbidden request'
    );
    echo json_encode($res);
    die();
}


// set headers
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: '. $client);
    header('Access-Control-Allow-Methods: POST, GET, DELETE, PUT, PATCH, OPTIONS');
    header('Access-Control-Allow-Headers: authorization, token, Content-Type, origin, access-control-allow-origin');
    header('Content-Length: 0');
    header('Content-Type: application/json');
    header('Access-Control-Allow-Credentials: true');
    die();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Access-Control-Allow-Origin: '. $client);
    header('Content-Type: application/json');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Access-Control-Allow-Credentials: true');
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && ($table == 'public' || $table === 'rss')) {
    header('Access-Control-Allow-Credentials: false');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($table == 'login' || $table == 'register')) {
    header('Access-Control-Allow-Origin: '. $client);
    header('Content-Type: application/json');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
//~ } elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && $table == 'register') {
    //~ header('Access-Control-Allow-Origin: '. $client);
    //~ header('Content-Type: application/json');
    //~ header('Access-Control-Allow-Methods: POST, OPTIONS');
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && ($table != 'login' && $table != 'register')) {
    header('Access-Control-Allow-Origin: '. $client);
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: authorization, token, Content-Type, origin, access-control-allow-origin');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Content-Type: application/json');
    header('Access-Control-Allow-Credentials: true');
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    header('Access-Control-Allow-Origin: '. $client);
    header('Access-Control-Allow-Methods: PUT, OPTIONS');
    header('Access-Control-Allow-Headers: authorization, token, Content-Type, origin, access-control-allow-origin');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Content-Type: application/json');
    header('Access-Control-Allow-Credentials: true');
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    header('Access-Control-Allow-Origin: '. $client);
    header('Access-Control-Allow-Methods: DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: authorization, token, Content-Type, origin, access-control-allow-origin');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Content-Type: application/json');
    header('Access-Control-Allow-Credentials: true');
}

// check user token
$userid = null;
$token = getBearerToken();
$auth = checkUser($token);

// escape the columns and values from the input object
if ($input) {
    $columns = preg_replace('/[^a-z0-9_]+/i', '', array_keys($input));
    $values = array_map(function ($value) use ($db) {
        if ($value===null) {
            return null;
        }
        return mysqli_real_escape_string($db, (string)$value);
    }, array_values($input));

    // build the SET part of the SQL command
    $set = '';
    if (end($values) === $userid) {
        for ($i=0;$i<count($columns);$i++) {
            $set.=($i>0?',':'').'`'.$columns[$i].'`=';
            $set.=($values[$i]===null?'NULL':'"'.$values[$i].'"');
        }
    } else {
        for ($i=0;$i<count($columns);$i++) {
            $set.=($i>0?',':'').'`'.$columns[$i].'`=';
            $set.=($values[$i]===null?'NULL':'"'.$values[$i].'"');
        }
    }
}



// check login form
if ($table == 'login' && $method == 'POST') {
    checkLogin();
}

// check register form
if ($table == 'register' && $method == 'POST') {
    $registration = register($db);
    echo json_encode($registration);
    mysqli_close($db);
    exit();
}

//memolinks public
if ($table == 'public' && $method == 'GET') {
    $publicResponse = getPublicMemolinks($key);
    exit();
}

//memolinks rss
if ($table == 'rss' && $method == 'GET') {
    $publicResponse = getRssMemolinks($key);
    exit();
}



// create SQL based on HTTP method
switch ($method) {
    case 'GET':
        // must be logged
        if ($table === 'categories') {
            $sql = "select * from `$table` WHERE (users_id=$userid) ORDER BY id ASC";
            break;
        }
        if ($table === 'links') {
            $sql = "select * from `$table`".($key?" WHERE (categories_id=$key) AND":'WHERE')." (users_id"."=$userid) ORDER BY id ASC";
            break;
        }
        break;
    case 'PUT':
        // update
        if ($auth && $table !== 'setpublic') {
            $sql = "update `$table` set $set where id=$key";
            break;
        }
        if ($auth && $table == 'setpublic') {
            $sql = "UPDATE `users` SET $set WHERE id=$userid";
            break;
        }
        
        invalidJWT($db);
        break;
    case 'POST':
        // create
        if ($auth) {
            $sql = "INSERT INTO `$table` set $set";
            break;
        } else {
            invalidJWT($db);
        }
        break;
    case 'DELETE':
        // delete
        if ($auth) {
            $sql = "DELETE FROM `$table` where id=$key and users_id=$userid";
            break;
        } else {
            invalidJWT($db);
        }
        break;
    default: invalidJWT($db);
}


// excecute SQL statement
$result = mysqli_query($db, $sql);

// die if SQL statement failed
if (!$result) {
    $res = array(
        'code' => 404,
        'status' => 'error',
        'message' => 'Not Found',
    );
    echo json_encode($res);
    die();
}

// print results, insert id or affected row count
if ($method == 'GET') {
    if (!$key) {
        echo '[';
    }
    for ($i=0;$i<mysqli_num_rows($result);$i++) {
        echo($i>0?',':'').json_encode(mysqli_fetch_object($result));
    }
    if (!$key) {
        echo ']';
    }
} elseif ($method == 'POST') {
    echo mysqli_insert_id($db);
} else {
    echo mysqli_affected_rows($db);
}

// close mysql connection
mysqli_close($db);

// Function part

function invalidJWT($db) {
    $res = array(
        'code' => 401,
        'status' => 'error',
        'message' => 'Invalid JWT - Authentication failed!'
    );
    echo json_encode($res);
    mysqli_close($db);
    exit();
}

function register() {
    global $db;
    // receive all input values from the form
    $data = json_decode(file_get_contents("php://input"), true);
    if (empty($data)) {
        return array(
            'code' => 400,
            'status' => 'error',
            'message' => 'Data missing'
        );
    } else {
        if (isset($data['username'])) {
            $username = $data['username'];
        } else {
            $username = null;
        }
        if (isset($data['email'])) {
            $email = $data['email'];
        } else {
            $email = null;
        }
        if (isset($data['password_1'])) {
            $password_1 = $data['password_1'];
        } else {
            $password_1 = null;
        }
        if (isset($data['password_2'])) {
            $password_2 = $data['password_2'];
        } else {
            $password_2 = null;
        }
    }
    
    $username = mysqli_real_escape_string($db, $username);
    $email = mysqli_real_escape_string($db, $email);
    $password_1 = mysqli_real_escape_string($db, $password_1);
    $password_2 = mysqli_real_escape_string($db, $password_2);
    
    // form validation: ensure that the form is correctly filled ...
    if (empty($username) || empty($email) || empty($password_1) || empty($password_2)) {
        return array(
            'code' => 400,
            'status' => 'error',
            'message' => 'All fields are required'
        );
    }
    if ($password_1 != $password_2) {
        return array(
            'code' => 400,
            'status' => 'error',
            'message' => 'The two passwords do not match'
        );
    }
    // first check the database to make sure 
    // a user does not already exist with the same username and/or email
    $user_check_query = "SELECT * FROM users WHERE username='$username' OR email='$email' LIMIT 1";
    $result = mysqli_query($db, $user_check_query);
    $user = mysqli_fetch_assoc($result);
    $errors = [];
    if ($user) {
        // if user exists
        if ($user['username'] === $username) {
            return array(
                'code' => 400,
                'status' => 'error',
                'message' => 'Username already exists'
            );
        }
        // if email exists
        if ($user['email'] === $email) {
            return array(
                'code' => 400,
                'status' => 'error',
                'message' => 'email already exists'
            );
        }
    }
    // Finally, register user if there are no errors in the form
    //encrypt the password before saving in the database
    $password = password_hash($password_1, PASSWORD_DEFAULT); 

    $sql = "INSERT INTO users (username, email, password) VALUES('$username', '$email', '$password')";
    $result = mysqli_query($db, $sql);
    if ($result) {
        return array(
            'code' => 200,
            'status' => 'success',
            'message' => 'Registration successfull'
        );
    } else {
        return array(
            'code' => 500,
            'status' => 'error',
            'message' => 'Registration failed for an unknown reason, try later please'
        );
    }
    
}

function getUserAccountData($userid) {
    global $db;
    $user_check_query = "SELECT * FROM users WHERE id='$userid' LIMIT 1";
    $result = mysqli_query($db, $user_check_query);
    $user = mysqli_fetch_assoc($result);

    // if id set then fetch particular account
    if (isset($userid)) {
        $result = array(
            'code' => '0',
            'status' => 'error',
            'message' => 'No match found'
        );
        
        if ($user['id'] === $userid) {
            // removing the password from the result
            unset($user['password']);
            $result = $user;
        }
    }
    return $result;
}

function checkUser($jwt) {
    global $userid;
    if (isset($jwt)) {
        // validate jwt
        $key = JWT_SECRET;
        try {
            $decoded = JWT::decode($jwt, $key, array('HS256'));
            $decoded_array = (array)$decoded;
            $userid = $decoded_array['userid'];
            $result = array(
                'code' => 200,
                'status' => 'success',
                'data' => getUserAccountData($decoded_array['userid']),
                'jwt_payload' => $decoded_array
            );
        } catch (\Exception $e) {
            $result = array(
                'code' => 401,
                'status' => 'error',
                'message' => 'Invalid JWT - Authentication failed!'
            );
        }
    } else {
        $result = array(
            'code' => 401,
            'status' => 'error',
            'message' => 'JWT parameter missing!'
        );
    }
    if ($result['code'] == 200) {
        return true;
    }
    return false;
}

function checkLogin() {
    global $db;
    $data = json_decode(file_get_contents("php://input"), true);
    if (empty($data)) {
        $result = array(
            'code' => 400,
            'status' => 'error',
            'message' => 'All fields are required',
        );
    } else {
        if (isset($data['username'])) {
            $username = $data['username'];
        } else {
            $username = null;
        }
        if (isset($data['password'])) {
            $password = $data['password'];
        } else {
            $password = null;
        }
        // check login credentials
        $result = array(
            'code' => 404,
            'status' => 'error',
            'message' => 'No match found'
        );

        $user_check_query = "SELECT * FROM users WHERE username='$username' LIMIT 1";
        $res = mysqli_query($db, $user_check_query);
        $user = mysqli_fetch_assoc($res);
        if ($user && $user['username'] === $username && password_verify($password, $user['password'])) {
            $result = array(
                'code' => 200,
                'status' => 'success',
                'message' => 'Valid login credentials.',
                'userid' => $user['id'],
                'role' => (int)$user['role'],
                'memolink_public' => (int)$user['memolink_public'],
                'memolink_public_url' => (int)$user['memolink_public_url']
            );
        }
        // on success generate jwt
        if (isset($result['status']) && $result['status'] === 'success') {
            $userid = $result['userid'];
            $issuedAt = time();
            $expirationTime = $issuedAt + 86400;  // jwt valid for 1800 seconds (30 mn) from the issued time
            $payload = array(
                'userid' => $userid,
                'iat' => $issuedAt,
                'exp' => $expirationTime
            );
            $key = JWT_SECRET;
            $alg = 'HS256';
            $jwt = JWT::encode($payload, $key, $alg);
            $result['jwt'] = $jwt;
        }
        if ($result['memolink_public_url'] == null) {
            $before = rand(50000,99999);
            $after = rand(50000,99999);
            $mid = (int)$result['userid'];
            $publicurl = $before.$mid.$after;
            $result['memolink_public_url'] = $publicurl;
            $l = $result['memolink_public_url'];
            $i = $result['userid'];
            $sql = "UPDATE users SET memolink_public_url = $l WHERE id=$i";
            $res = mysqli_query($db, $sql);
            $result['test'] = $sql;
        }
    }
    echo json_encode($result);
    exit();
}

function getAuthorizationHeader() {
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER["Authorization"]);
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        //Nginx or fast CGI
        $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        // Server-side fix for bug in old Android versions (a nice side-effect of this fix means we don't care about capitalization for Authorization)
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    return $headers;
}

function getBearerToken() {
    $headers = getAuthorizationHeader();
    // Get the access token from the header
    if (!empty($headers)) {
        if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
            return $matches[1];
        }
    }
    return null;
}

function setPublicUrl ($result) {
    global $db;
    $l = $result['memolink_public_url'];
    $i = $result['userid'];
    $sql = "UPDATE users SET memolink_public_url = $l WHERE id=$i";
    $res = mysqli_query($db, $sql);
    exit();
}

function getPublicMemolinks() {
    global $db;
    global $key;
    global $table;
    $id = substr(substr(strval($key),5), 0, strlen(substr(strval($key),5))-5);
    $user = getUserAccountData($id);
    if ($user['memolink_public'] == 0 || $key !== (int)$user['memolink_public_url']) {
        $res = array(
            'code' => 404,
            'status' => 'error',
            'message' => "This MemoLinks isn't public or doesn't exists",
        );
        echo json_encode($res);
        die();
    }
    
    $sql = "select * from `categories` WHERE (users_id=$id) AND (is_public=1) ORDER BY id ASC";
    $result = mysqli_query($db, $sql);

// die if SQL statement failed
    if (!$result) {
        $res = array(
            'code' => 404,
            'status' => 'error',
            'message' => 'Not Found',
        );
        echo json_encode($res);
        die();
    }
    
    // print results, insert id or affected row count
    echo '[[';
    for ($i=0;$i<mysqli_num_rows($result);$i++) {
        echo($i>0?',':'').json_encode(mysqli_fetch_object($result));
    }
    echo ']';
    
    $sql = "select * from `links` WHERE (users_id=$id) ORDER BY id ASC";
    $result = mysqli_query($db, $sql);
    if (!$result) {
        $res = array(
            'code' => 404,
            'status' => 'error',
            'message' => 'Not Found',
        );
        echo json_encode($res);
        die();
    }

    // print results, insert id or affected row count
    echo ',[';
    for ($i=0;$i<mysqli_num_rows($result);$i++) {
        echo($i>0?',':'').json_encode(mysqli_fetch_object($result));
    }
    echo '],[';
    echo json_encode($user['username']);
    echo ']]';

    die();
    // close mysql connection
    mysqli_close($db);
}

function getRssMemolinks() {
    global $db;
    global $key;
    global $table;
    $id = substr(substr(strval($key),5), 0, strlen(substr(strval($key),5))-5);
    $user = getUserAccountData($id);
    if ($user['memolink_public'] == 0 || $key !== (int)$user['memolink_public_url']) {
        $res = array(
            'code' => 404,
            'status' => 'error',
            'message' => "This MemoLinks isn't public or doesn't exists",
        );
        echo json_encode($res);
        die();
    }

    $sql = "select * from `categories` WHERE (users_id=$id) AND (is_public=1)";
    $categories = mysqli_query($db, $sql);
    $isPublic = [];
    for ($i=0;$i<mysqli_num_rows($categories);$i++) {
        $resultToArray = mysqli_fetch_object($categories);
        array_push($isPublic, $resultToArray->id);
    }
    
    $actual_link = "https://{$_SERVER['HTTP_HOST']}{$_SERVER['REQUEST_URI']}";
    // generate json feed
    echo '
{"version": "https://jsonfeed.org/version/1",
"title": '.json_encode($user['username']." Feed").',
"home_page_url": '.json_encode($actual_link).',
"feed_url": '.json_encode($actual_link).',
"items": [';
    
    $sql = "select * from `links` WHERE (users_id=$id) ORDER BY id DESC LIMIT 0, 25";
    $result = mysqli_query($db, $sql);
    if (!$result) {
        $res = array(
            'code' => 404,
            'status' => 'error',
            'message' => 'Not Found',
        );
        echo json_encode($res);
        die();
    }

    for ($i=0;$i<mysqli_num_rows($result);$i++) {
        $resultToJRSS = mysqli_fetch_object($result);
        if (in_array($resultToJRSS->categories_id, $isPublic, false)) {
            $res = array(
                'id' => $resultToJRSS->id,
                'title' => $resultToJRSS->label,
                'external_url' => $resultToJRSS->link,
            );
            echo($i>0?',':'').json_encode($res);
        }
    }
    echo ']}';
    die();
    // close mysql connection
    mysqli_close($db);
}
