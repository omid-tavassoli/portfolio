<?php

class Journey {
    private PDO $pdo;
    public const TYPES = ['education', 'experience', 'internship', 'work', 'volunteer', 'other'];

    public function __construct() {
        $this->pdo = db::connect();
    }

    public function get(): array {
        $stmt = $this->pdo->prepare("SELECT * FROM journey ORDER BY id");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find(int $id): array {
        $stmt = $this->pdo->prepare("SELECT * FROM journey WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    public function create(string $type, string $timeline, string $title, string $institution, string $description): int {
        $this->checkType($type);

        $stmt = $this->pdo->prepare(
            "INSERT INTO journey (type, timeline, title, institution, description)
             VALUES (:type, :timeline, :title, :institution, :description)"
        );
        $stmt->bindParam(':type', $type);
        $stmt->bindParam(':timeline', $timeline);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':institution', $institution);
        $stmt->bindParam(':description', $description);
        $stmt->execute();
        return (int) $this->pdo->lastInsertId();
    }

    public function update(int $id, string $type, string $timeline, string $title, string $institution, string $description): bool {
        $this->checkType($type);

        $stmt = $this->pdo->prepare(
            "UPDATE journey SET type = :type, timeline = :timeline, title = :title,
                institution = :institution, description = :description
             WHERE id = :id"
        );
        $stmt->bindParam(':type', $type);
        $stmt->bindParam(':timeline', $timeline);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':institution', $institution);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function delete(int $id): bool {
        $stmt = $this->pdo->prepare("DELETE FROM journey WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    private function checkType(string $type): void {
        if (!in_array($type, self::TYPES, true)) {
            throw new InvalidArgumentException("Invalid journey type: $type");
        }
    }
}
