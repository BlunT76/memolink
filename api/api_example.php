<?php
require_once './vendor/autoload.php';
use Firebase\JWT\JWT;

/* ----------CONFIG---------- */

// connect to the mysql database
$db = mysqli_connect('dburl', 'username', 'password', 'database');
mysqli_set_charset($db, 'utf8');

// JWT secret
define('JWT_SECRET', 'type you secret');

// Forbidden tables
$forbiddenTables = ['users'];

// Authorized client needed for cors
// $client = 'http://localhost:3000';
$client = 'https://yoursite.url';


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



if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: '. $client);
    header('Access-Control-Allow-Methods: POST, GET, DELETE, PUT, PATCH, OPTIONS');
    header('Access-Control-Allow-Headers: authorization, token, Content-Type, origin, access-control-allow-origin');
    header('Access-Control-Max-Age: 1728000');
    // header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
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

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $table == 'login') {
    header('Access-Control-Allow-Origin: '. $client);
    header('Content-Type: application/json');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && $table == 'register') {
    header('Access-Control-Allow-Origin: '. $client);
    header('Content-Type: application/json');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && $table != 'login' && $table != 'register') {
    header('Access-Control-Allow-Origin: '. $client);
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: authorization, token, Content-Type, origin, access-control-allow-origin');
    header('Access-Control-Max-Age: 1728000');
    // header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    header('Content-Type: application/json');
    header('Access-Control-Allow-Credentials: true');
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    header('Access-Control-Allow-Origin: '. $client);
    header('Access-Control-Allow-Methods: PUT, OPTIONS');
    header('Access-Control-Allow-Headers: authorization, token, Content-Type, origin');
    header('Access-Control-Max-Age: 1728000');
    // header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    header('Content-Type: application/json');
    header('Access-Control-Allow-Credentials: true');
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    header('Access-Control-Allow-Origin: '. $client);
    header('Access-Control-Allow-Methods: DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: authorization, token, Content-Type, origin, access-control-allow-origin');
    header('Access-Control-Max-Age: 1728000');
    // header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    header('Content-Type: application/json');
    header('Access-Control-Allow-Credentials: true');
}

// check user token
$userid = null;
$token = getBearerToken();
$auth = checkUser($token);
// echo json_encode($userid);

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

    // echo json_encode(end($values));
    if (end($values) === $userid) {
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





// create SQL based on HTTP method
switch ($method) {
    case 'GET':
        // must be logged
        if ($table === 'projects') {
            $sql = "select * from `$table`".($key?" WHERE (id=$key) AND":'WHERE')." (users_id"."=$userid) ORDER BY id ASC";
        }
        if ($table === 'lists') {
            $sql = "select * from `$table`".($key?" WHERE (projects_id=$key) AND":'WHERE')." (users_id"."=$userid) ORDER BY id ASC";
        }
        if ($table === 'tasks') {
            $sql = "select * from `$table`".($key?" WHERE (lists_id=$key) AND":'WHERE')." (users_id"."=$userid) ORDER BY id ASC";
        }
        if ($table === 'categories') {
            $sql = "select * from `$table` WHERE (users_id=$userid) ORDER BY id ASC";
        }
        if ($table === 'links') {
            $sql = "select * from `$table`".($key?" WHERE (categories_id=$key) AND":'WHERE')." (users_id"."=$userid) ORDER BY id ASC";
        }
        // echo json_encode($sql);
        // $sql = "select * from `$table`".($key?" WHERE id=$key":'ORDER BY id DESC'); // original query
        break;
    case 'PUT':
        // update
        if ($auth) {
            $sql = "update `$table` set $set where id=$key";
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
        // no break
    case 'DELETE':
        // delete
        if ($auth) {
            $sql = "DELETE FROM `$table` where id=$key and users_id=$userid";
            break;
        } else {
            invalidJWT($db);
        }
        // no break
    default: invalidJWT($db);
}


// excecute SQL statement
$result = mysqli_query($db, $sql);

// die if SQL statement failed
if (!$result) {
    $res = array(
        'code' => 404,
        'status' => 'error',
        'message' => 'Not Found'
    );
    echo json_encode($res);
    die();
}



// print results, insert id or affected row count
if ($method == 'GET') {
    if (!$key || ($table === "lists" || $table === "tasks")) {
        echo '[';
    }
    for ($i=0;$i<mysqli_num_rows($result);$i++) {
        echo($i>0?',':'').json_encode(mysqli_fetch_object($result));
    }
    if (!$key || ($table === "lists" || $table === "tasks")) {
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
    /**
     * if id set
     * then fetch particular account
     */
    if (isset($userid)) {
        $result = array(
            'code' => '0',
            'status' => 'error',
            'message' => 'No match found'
        );
        
    if ($user['id'] === $userid) {
        // use removing the password from the result
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
            // echo json_encode($result);
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
                'userid' => $user['id']
            );
        }
        // on success generate jwt
        if (isset($result['status']) && $result['status'] === 'success') {
            $userid = $result['userid'];
            $issuedAt = time();
            $expirationTime = $issuedAt + 1800;  // jwt valid for 1800 seconds (30 mn) from the issued time
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
