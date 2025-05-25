<?php
class Database
{
    private $host;
    private $username;
    private $password;
    private $database;
    private $conn;

    public function __construct()
    {
        $this->host = defined('DB_HOST') ? DB_HOST : 'localhost';
        $this->username = defined('DB_USER') ? DB_USER : 'root';
        $this->password = defined('DB_PASS') ? DB_PASS : '';
        $this->database = defined('DB_NAME') ? DB_NAME : 'Visualist';
    }

    public function connect()
    {
        $this->conn = null;

        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->database, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            echo "Connection Error: " . $e->getMessage();
        }

        return $this->conn;
    }
}
