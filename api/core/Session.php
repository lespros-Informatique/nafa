<?php

class Session
{
    public const COOKIE_NAME = 'nafa_session';

    public static function start(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_set_cookie_params([
                'lifetime' => App::config('session_lifetime', 86400 * 30),
                'path' => '/',
                'domain' => '',
                'secure' => App::config('cookie_secure', false),
                'httponly' => App::config('cookie_httponly', true),
                'samesite' => App::config('cookie_samesite', 'Lax'),
            ]);
            session_name(self::COOKIE_NAME);
            session_start();
        }
    }

    public static function regenerate(): void
    {
        self::start();
        session_regenerate_id(true);
    }

    public static function set(string $key, mixed $value): void
    {
        self::start();
        $_SESSION[$key] = $value;
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        self::start();
        return $_SESSION[$key] ?? $default;
    }

    public static function has(string $key): bool
    {
        self::start();
        return isset($_SESSION[$key]);
    }

    public static function all(): array
    {
        self::start();
        return $_SESSION;
    }

    public static function destroy(): void
    {
        self::start();
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(self::COOKIE_NAME, '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
        }
        session_destroy();
    }

    public static function resume(string $sessionId): bool
    {
        if (session_status() === PHP_SESSION_ACTIVE && session_id() === $sessionId) {
            return self::has('user');
        }

        $sessionFile = sys_get_temp_dir() . '/sess_' . $sessionId;
        if (!file_exists($sessionFile)) {
            return false;
        }

        session_id($sessionId);
        session_start();
        return self::has('user');
    }
}
