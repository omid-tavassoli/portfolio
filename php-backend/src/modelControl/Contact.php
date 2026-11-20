<?php

class Contact {
    private PDO $pdo;

    public function __construct() {
        $this->pdo = db::connect();
    }

    public function get(): array {
        $stmt = $this->pdo->prepare("SELECT * FROM contact WHERE id = 1");
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    public function update(string $header, string $email, string $phone, string $githubUrl, string $linkedinUrl, string $description): bool {
        $stmt = $this->pdo->prepare(
            "UPDATE contact SET header = :header, email = :email, phone = :phone,
                github_url = :github_url, linkedin_url = :linkedin_url, description = :description
             WHERE id = 1"
        );
        $stmt->bindParam(':header', $header);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':github_url', $githubUrl);
        $stmt->bindParam(':linkedin_url', $linkedinUrl);
        $stmt->bindParam(':description', $description);
        return $stmt->execute();
    }
}
