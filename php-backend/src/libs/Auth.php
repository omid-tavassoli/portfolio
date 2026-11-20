<?php
require_once __DIR__ . '/JWT.php';
    class Auth {

        // must run before any output, which holds for every caller (all call Auth before echoing)
        private static function startSession(): void {
            if (session_status() === PHP_SESSION_NONE) {
                ini_set('session.use_strict_mode', '1'); // reject session ids the server never issued
                session_start();
            }
        }

        public static function checkAdminSession() {
            self::startSession();
            if (!isset($_SESSION['admin_email']) || !isset($_SESSION['access_token'])) {
                return false;
            }
            if(JWT::validateToken($_SESSION['access_token'] ) === false ) {
                self::logOutAdmin();
                return false;
            }
            else {
                return true;
            }
        }

        public static function logInAdmin(string $adminEmail, int $adminId) {
            if (empty($adminEmail) || !filter_var($adminEmail, FILTER_VALIDATE_EMAIL)) {
                throw new InvalidArgumentException("Email not valid.");
            }
            if ($adminId <= 0) {
                throw new InvalidArgumentException("Admin ID not valid.");
            }
            self::startSession();
            // new id on login so a session id planted before login can't be used afterwards
            session_regenerate_id(true);
            $_SESSION['admin_email'] = $adminEmail;
            $_SESSION['access_token'] = JWT::generateToken(['email' => $adminEmail, 'id' => $adminId]);
        }

        public static function logOutAdmin() {
            self::startSession();
            session_unset();
            session_destroy();
            if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', time() - 42000, $params["path"], $params["domain"]);
            }
        }
    }
?>