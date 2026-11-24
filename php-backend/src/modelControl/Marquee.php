<?php

// words in the scrolling strip under the hero, shown in creation order
class Marquee {
    private PDO $pdo;

    public function __construct() {
        $this->pdo = db::connect();
    }

    public function get(): array {
        $stmt = $this->pdo->prepare("SELECT * FROM marquee ORDER BY id");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find(int $id): array {
        $stmt = $this->pdo->prepare("SELECT * FROM marquee WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    // the column's collation ignores case, so "docker" matches "Docker"
    public function exists(string $label): bool {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM marquee WHERE label = :label");
        $stmt->bindParam(':label', $label);
        $stmt->execute();
        return (bool) $stmt->fetchColumn();
    }

    public function create(string $label): int {
        $stmt = $this->pdo->prepare("INSERT INTO marquee (label) VALUES (:label)");
        $stmt->bindParam(':label', $label);
        $stmt->execute();
        return (int) $this->pdo->lastInsertId();
    }

    public function delete(int $id): bool {
        $stmt = $this->pdo->prepare("DELETE FROM marquee WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
