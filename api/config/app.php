<?php

return [
    'secret_key' => 'change_me_' . ($_SERVER['SERVER_NAME'] ?? 'localhost') . '_' . __FILE__,
    'session_lifetime' => 86400 * 30,
    'cookie_secure' => false,
    'cookie_httponly' => true,
    'cookie_samesite' => 'Lax',
];
