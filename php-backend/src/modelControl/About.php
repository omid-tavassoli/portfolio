<?php

class About {
    private PDO $pdo;

    public function __construct() {
        $this->pdo = db::connect();
    }

    public function get(): array {
        $stmt = $this->pdo->prepare("SELECT * FROM about WHERE id = 1");
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    public function update(string $title, string $description): bool {
        $stmt = $this->pdo->prepare("UPDATE about SET title = :title, description = :description WHERE id = 1");
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':description', $description);
        return $stmt->execute();
    }
}