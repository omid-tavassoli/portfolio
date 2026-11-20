<?php
    class EnvUtil {
        public static function getEnv(string $key) {
            $value = getenv($key);
            if ($value === false || $value === null || $value === '') {
                throw new Exception("Environment variable not found: " . $key);
            }

            return $value;
        }
    }
?>