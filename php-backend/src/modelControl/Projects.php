<?php

class Projects {
    private PDO $pdo;

    public function __construct() {
        $this->pdo = db::connect();
    }

    public function get(): array {
        $stmt = $this->pdo->prepare("SELECT * FROM projects ORDER BY id");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find(int $id): array {
        $stmt = $this->pdo->prepare("SELECT * FROM projects WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    public function create(string $title, string $description, string $technologies, ?string $imageUrl, ?string $githubUrl, ?string $liveUrl): int {
        $stmt = $this->pdo->prepare(
            "INSERT INTO projects (title, description, image_url, github_url, live_url, technologies)
             VALUES (:title, :description, :image_url, :github_url, :live_url, :technologies)"
        );
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':image_url', $imageUrl);
        $stmt->bindParam(':github_url', $githubUrl);
        $stmt->bindParam(':live_url', $liveUrl);
        $stmt->bindParam(':technologies', $technologies);
        $stmt->execute();
        return (int) $this->pdo->lastInsertId();
    }

    public function update(int $id, string $title, string $description, string $technologies, ?string $imageUrl, ?string $githubUrl, ?string $liveUrl): bool {
        $stmt = $this->pdo->prepare(
            "UPDATE projects SET title = :title, description = :description, image_url = :image_url,
                github_url = :github_url, live_url = :live_url, technologies = :technologies
             WHERE id = :id"
        );
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':image_url', $imageUrl);
        $stmt->bindParam(':github_url', $githubUrl);
        $stmt->bindParam(':live_url', $liveUrl);
        $stmt->bindParam(':technologies', $technologies);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function delete(int $id): bool {
        $stmt = $this->pdo->prepare("DELETE FROM projects WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
