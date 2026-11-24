<?php

// the "// currently" card next to about: a single row (id = 1), like About
class Currently {
    private PDO $pdo;

    public function __construct() {
        $this->pdo = db::connect();
    }

    public function get(): array {
        $stmt = $this->pdo->prepare("SELECT * FROM currently WHERE id = 1");
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            return [];
        }
        $row['available'] = (bool) $row['available']; // MySQL BOOLEAN is TINYINT(1); return true/false
        return $row;
    }

    public function update(string $status, bool $available, string $location, string $degree, string $focus): bool {
        $stmt = $this->pdo->prepare(
            "UPDATE currently SET status = :status, available = :available, location = :location,
                degree = :degree, focus = :focus
             WHERE id = 1"
        );
        $stmt->bindParam(':status', $status);
        $stmt->bindValue(':available', $available, PDO::PARAM_BOOL);
        $stmt->bindParam(':location', $location);
        $stmt->bindParam(':degree', $degree);
        $stmt->bindParam(':focus', $focus);
        return $stmt->execute();
    }
}
