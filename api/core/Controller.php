<?php

abstract class Controller
{
    protected function input(string $key, $default = null)
    {
        $data = $this->jsonInput();
        return $data[$key] ?? $default;
    }

    protected function jsonInput(): array
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        if ($method === 'GET') {
            return $_GET;
        }

        $contentType = strtolower($_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '');
        if (strpos($contentType, 'application/json') !== false) {
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true);
            return is_array($data) ? $data : [];
        }

        return $_POST;
    }

    protected function requireAuth(): array
    {
        $headers = getallheaders();
        $token = $headers['Authorization'] ?? $headers['authorization'] ?? null;
        if (!$token && isset($_COOKIE['nafa_user'])) {
            $userData = json_decode(base64_decode($_COOKIE['nafa_user']), true);
            if ($userData && isset($userData['telephone_user'])) {
                return $userData;
            }
        }
        if (!$token) {
            Response::error('Non autorisé', [], 401);
        }
        $token = preg_replace('/^Bearer\s+/i', '', $token);
        $parts = explode(':', base64_decode($token));
        if (count($parts) !== 2) {
            Response::error('Token invalide', [], 401);
        }
        [$phone] = $parts;
        $user = User::findByPhone($phone);
        if (!$user) {
            Response::error('Utilisateur introuvable', [], 401);
        }
        return $user;
    }
}
