<?php

class Skills {
    // must match the ENUM on skills.header in schema.sql (same order = display order)
    public const HEADERS = ['Programming Languages', 'Backend & Security', 'Frontend & Data', 'Machine Learning', 'AI', 'DevOps & Tools', 'Tools', 'Languages'];

    private PDO $pdo;

    public function __construct() {
        $this->pdo = db::connect();
    }

    public function get(): array {
        $stmt = $this->pdo->prepare("SELECT * FROM skills ORDER BY header, id");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find(int $id): array {
        $stmt = $this->pdo->prepare("SELECT * FROM skills WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    public function create(string $header, string $skill): int {
        $stmt = $this->pdo->prepare("INSERT INTO skills (header, skill) VALUES (:header, :skill)");
        $stmt->bindParam(':header', $header);
        $stmt->bindParam(':skill', $skill);
        $stmt->execute();
        return (int) $this->pdo->lastInsertId();
    }

    // public function update(string $header, string $skill, string $oldHeader, string $oldSkill): bool {
    //     $stmt = $this->pdo->prepare("UPDATE skills SET header = :header, skill = :skill WHERE header = :oldHeader AND skill = :oldSkill");
    //     $stmt->bindParam(':header', $header);
    //     $stmt->bindParam(':skill', $skill);
    //     $stmt->bindParam(':oldHeader', $oldHeader);
    //     $stmt->bindParam(':oldSkill', $oldSkill);
    //     return $stmt->execute();
    // }

    public function delete(string $header, string $skill): bool {
        $stmt = $this->pdo->prepare("DELETE FROM skills WHERE header = :header AND skill = :skill");
        $stmt->bindParam(':header', $header);
        $stmt->bindParam(':skill', $skill);
        return $stmt->execute();
    }

    public function skillExists(string $header, string $skill): bool {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM skills WHERE header = :header AND skill = :skill");
        $stmt->bindParam(':header', $header);
        $stmt->bindParam(':skill', $skill);
        $stmt->execute();
        return (bool) $stmt->fetchColumn();
    }
}
