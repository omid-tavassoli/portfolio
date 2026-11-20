<?php

class LoginAttempts {
    private const WINDOW_MINUTES = 15;
    private const MAX_PER_EMAIL = 5;
    private const MAX_PER_IP = 20;

    private PDO $pdo;

    public function __construct() {
        $this->pdo = db::connect();
    }

    // seconds until another attempt is allowed; 0 means not limited
    public function retryAfter(string $email, string $ip): int {
        return max(
            $this->secondsUntilBelowLimit('email', $email, self::MAX_PER_EMAIL),
            $this->secondsUntilBelowLimit('ip', $ip, self::MAX_PER_IP)
        );
    }

    public function recordFailure(string $email, string $ip): void {
        $this->pdo->exec("DELETE FROM login_attempts WHERE attempted_at < NOW() - INTERVAL 1 DAY");

        $stmt = $this->pdo->prepare("INSERT INTO login_attempts (email, ip) VALUES (:email, :ip)");
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':ip', $ip);
        $stmt->execute();
    }

    public function clear(string $email, string $ip): void {
        $stmt = $this->pdo->prepare("DELETE FROM login_attempts WHERE email = :email OR ip = :ip");
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':ip', $ip);
        $stmt->execute();
    }

    // $column is only ever 'email' or 'ip', never user input
    private function secondsUntilBelowLimit(string $column, string $value, int $limit): int {
        // once the $limit-th most recent failure leaves the window, fewer than $limit remain
        $stmt = $this->pdo->prepare(
            "SELECT TIMESTAMPDIFF(SECOND, NOW(), attempted_at + INTERVAL " . self::WINDOW_MINUTES . " MINUTE)
             FROM login_attempts
             WHERE $column = :value AND attempted_at > NOW() - INTERVAL " . self::WINDOW_MINUTES . " MINUTE
             ORDER BY attempted_at DESC, id DESC
             LIMIT 1 OFFSET " . ($limit - 1)
        );
        $stmt->bindParam(':value', $value);
        $stmt->execute();
        $seconds = $stmt->fetchColumn();
        return $seconds === false ? 0 : max(1, (int) $seconds);
    }
}
