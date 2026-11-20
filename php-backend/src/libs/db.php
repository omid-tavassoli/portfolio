<?php

    final class db {
        // one connection per request, shared by every model; PHP discards it when the request ends
        private static ?PDO $pdo = null;

        public static function connect(): PDO
        {
            if (self::$pdo !== null) {
                return self::$pdo;
            }

            $host = EnvUtil::getEnv('DB_HOST');
            $user = EnvUtil::getEnv('DB_USER');
            $password = EnvUtil::getEnv('DB_PASSWORD');
            $dbname = EnvUtil::getEnv('DB_NAME');
            $port = (int) EnvUtil::getEnv('DB_PORT');

            $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";

            // a failed connection throws PDOException up to the endpoint's catch block (logged + clean 500 JSON)
            $pdo = new PDO($dsn, $user, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

            return self::$pdo = $pdo;
        }

    }