<?php

// hero chips: up to 5, each on one of the 5 fixed positions (slot 1–5) around the name
class Chips {
    public const SLOTS = [1, 2, 3, 4, 5];

    private PDO $pdo;

    public function __construct() {
        $this->pdo = db::connect();
    }

    public function get(): array {
        $stmt = $this->pdo->prepare("SELECT * FROM chips ORDER BY slot");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find(int $id): array {
        $stmt = $this->pdo->prepare("SELECT * FROM chips WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    public function findBySlot(int $slot): array {
        $stmt = $this->pdo->prepare("SELECT * FROM chips WHERE slot = :slot");
        $stmt->bindParam(':slot', $slot, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    public function create(int $slot, string $label, string $icon): int {
        $stmt = $this->pdo->prepare("INSERT INTO chips (slot, label, icon) VALUES (:slot, :label, :icon)");
        $stmt->bindParam(':slot', $slot, PDO::PARAM_INT);
        $stmt->bindParam(':label', $label);
        $stmt->bindParam(':icon', $icon);
        $stmt->execute();
        return (int) $this->pdo->lastInsertId();
    }

    public function update(int $id, int $slot, string $label, string $icon): bool {
        $stmt = $this->pdo->prepare("UPDATE chips SET slot = :slot, label = :label, icon = :icon WHERE id = :id");
        $stmt->bindParam(':slot', $slot, PDO::PARAM_INT);
        $stmt->bindParam(':label', $label);
        $stmt->bindParam(':icon', $icon);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function delete(int $id): bool {
        $stmt = $this->pdo->prepare("DELETE FROM chips WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
