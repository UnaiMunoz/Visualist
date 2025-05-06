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
        $query = "SELECT user_id, name, email, password, short_bio FROM " . $this->table . " 
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
            $this->short_bio = $row['short_bio'];
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

    // Get user by ID
    public function getUserById()
    {
        $query = "SELECT user_id, name, email, short_bio, created_at FROM " . $this->table . " 
                  WHERE user_id = :user_id";

        $stmt = $this->conn->prepare($query);

        // Bind parameters
        $stmt->bindParam(':user_id', $this->user_id);

        // Execute query
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $this->name = $row['name'];
            $this->email = $row['email'];
            $this->short_bio = $row['short_bio'];
            $this->created_at = $row['created_at'];
            return true;
        }

        return false;
    }

    // Verify the current password
    public function verifyPassword($password)
    {
        $query = "SELECT password FROM " . $this->table . " WHERE user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->execute();

        if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            return password_verify($password, $row['password']);
        }

        return false;
    }

    // Update user profile
    public function updateProfile($updatePassword = false)
    {
        // Start with basic profile update query
        $query = "UPDATE " . $this->table . " SET 
                  name = :name, 
                  short_bio = :short_bio";

        // Add password update if needed
        if ($updatePassword) {
            $query .= ", password = :password";
        }

        $query .= " WHERE user_id = :user_id";

        $stmt = $this->conn->prepare($query);

        // Sanitize inputs
        $this->name = htmlspecialchars(strip_tags($this->name));
        if ($this->short_bio) {
            $this->short_bio = htmlspecialchars(strip_tags($this->short_bio));
        }

        // Bind parameters
        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':short_bio', $this->short_bio);
        $stmt->bindParam(':user_id', $this->user_id);

        // Bind password if updating
        if ($updatePassword) {
            // Hash the new password
            $password_hash = password_hash($this->password, PASSWORD_BCRYPT);
            $stmt->bindParam(':password', $password_hash);
        }

        // Execute query and return result
        return $stmt->execute();
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
