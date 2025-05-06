<?php
require_once 'Database.php';

class User
{
    private $conn;
    private $table = 'Users';

    public $user_id;
    public $name;
    public $email;
    public $password;
    public $short_bio;
    public $profile_picture;
    public $created_at;
    public $last_login;

    public function __construct()
    {
        $database = new Database();
        $this->conn = $database->connect();
    }

    // Register new user
    public function register()
    {
        // Check if email already exists
        if ($this->emailExists()) {
            return false;
        }

        $query = "INSERT INTO " . $this->table . " 
                  (name, email, password) 
                  VALUES (:name, :email, :password)";

        $stmt = $this->conn->prepare($query);

        // Sanitize inputs
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->email = htmlspecialchars(strip_tags($this->email));

        // Hash password
        $this->password = password_hash($this->password, PASSWORD_BCRYPT);

        // Bind parameters
        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':password', $this->password);

        // Execute query
        if ($stmt->execute()) {
            return true;
        }

        // If something went wrong, return false
        return false;
    }

    // Login user
    public function login()
    {
        $query = "SELECT user_id, name, email, password FROM " . $this->table . " 
                  WHERE email = :email";

        $stmt = $this->conn->prepare($query);

        // Sanitize email
        $this->email = htmlspecialchars(strip_tags($this->email));

        // Bind parameters
        $stmt->bindParam(':email', $this->email);

        // Execute query
        $stmt->execute();

        // Get row count
        $num = $stmt->rowCount();

        if ($num > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            $this->user_id = $row['user_id'];
            $this->name = $row['name'];
            $db_password = $row['password'];

            // Verify password
            if (password_verify($this->password, $db_password)) {
                // Update last_login timestamp
                $this->updateLastLogin();
                return true;
            }
        }

        return false;
    }

    // Check if email already exists
    private function emailExists()
    {
        $query = "SELECT user_id FROM " . $this->table . " 
                  WHERE email = :email";

        $stmt = $this->conn->prepare($query);

        // Sanitize email
        $this->email = htmlspecialchars(strip_tags($this->email));

        // Bind parameters
        $stmt->bindParam(':email', $this->email);

        // Execute query
        $stmt->execute();

        // Get row count
        $num = $stmt->rowCount();

        return $num > 0;
    }

    // Update last login timestamp
    private function updateLastLogin()
    {
        $query = "UPDATE " . $this->table . " 
                  SET last_login = CURRENT_TIMESTAMP 
                  WHERE user_id = :user_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $this->user_id);

        return $stmt->execute();
    }
}
