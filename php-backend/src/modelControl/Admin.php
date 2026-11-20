<?php

    final class Admin {
        private int $id;
        private string $username;
        private string $email;
        private string $password;
        private  \PDO $pdo;

        public function __construct() {

            $this->pdo = db::connect();
        }

        public function createAdmin(string $username, string $email, string $password) {

            $this->checkUserNameInput($username);
            $this->checkEmailInput($email,$this->pdo);
            $this->checkPasswordInput($password);

            try {
                $stmt = $this->pdo->prepare("INSERT INTO admins (username, email, password) VALUES (:username, :email, :password)");
                $stmt->bindParam(':username', $this->username);
                $stmt->bindParam(':email', $this->email);
                $stmt->bindParam(':password', $this->password);
                $stmt->execute();
            } catch (PDOException $e) {
                throw new Exception("Database error: " . $e->getMessage());
            }

            $this->id = $this->pdo->lastInsertId();
            return $this;
        }

        public function logInAdmin(string $email, string $password) {
            
            if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw new InvalidArgumentException("Email not valid.");
            }
            if (empty($password)) {
                throw new InvalidArgumentException("Password cannot be empty.");
            }

            try {
                $stmt = $this->pdo->prepare("SELECT * FROM admins WHERE email = :email");
                $stmt->bindParam(':email', $email);
                $stmt->execute();
                $admin = $stmt->fetch(PDO::FETCH_ASSOC);
            } catch (PDOException $e) {
                throw new Exception("Database error: " . $e->getMessage());
            }

            if (!$admin || !password_verify($password, $admin['password'])) {
                throw new InvalidArgumentException("Invalid email or password.");
            }

            $this->username = $admin['username'];
            $this->email = $admin['email'];
            $this->id = $admin['id'];
            return $this;
        }

        private function checkUserNameInput($username) {
            if (empty($username)) {
                throw new InvalidArgumentException("Username cannot be empty.");
            }
            $this->username = $username;
        }

        private function checkEmailInput($email,$pdo) {
            if (empty($email)) {
                throw new InvalidArgumentException("Email cannot be empty.");
            }
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw new InvalidArgumentException("Invalid email format.");
            }
            try {
                $stmt = $pdo->prepare("SELECT COUNT(*) FROM admins WHERE email = :email");
                $stmt->bindParam(':email', $email);
                $stmt->execute();
                $count = $stmt->fetchColumn();
            } catch (PDOException $e) {
                throw new Exception("Database error: " . $e->getMessage());
            }
            if ($count > 0) {
                throw new InvalidArgumentException("Email already exists.");
            }
            $this->email = $email;
        }

        private function checkPasswordInput($password) {
            if (empty($password)) {
                throw new InvalidArgumentException("Password cannot be empty.");
            }
            if (strlen($password) < 8) {
                throw new InvalidArgumentException("Password must be at least 8 characters long.");
            }
            $this->password = password_hash($password, PASSWORD_DEFAULT);
        }

        public function getId() {
            if ($this->id){
                return $this->id;
            }
            else if (!$this->id && $this->email){
                try {
                    $stmt = $this->pdo->prepare("SELECT id FROM admins WHERE email = :email");
                    $stmt->bindParam(':email', $this->email);
                    $stmt->execute();
                    $id = $stmt->fetchColumn();
                } catch (PDOException $e) {
                    throw new Exception("Database error: " . $e->getMessage());
                }
                $this->id = $id;
                return $id;
            }
            return NULL;
        }

        public function getUsername() {
            return ($this->username)? $this->username : NULL;
        }

        public function getEmail() {
            return ($this->email)? $this->email : NULL;
        }

    }

?>