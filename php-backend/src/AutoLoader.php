<?php

// sessions are started by Auth only when needed, so public endpoints like getContent.php set no cookie
spl_autoload_register(function ($className) {
    $directories = [
        __DIR__ . '/modelControl/',
        __DIR__ . '/libs/',
        __DIR__ . '/config/',
    ];

    foreach ($directories as $directory) {
        $file = $directory . $className . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});