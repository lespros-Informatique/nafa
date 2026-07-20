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

    protected function requireActiveSubscription(): array
    {
        $user = $this->requireAuth();

        if (($user['role_user'] ?? '') === 'developpeur') {
            return $user;
        }

        $shop = Shop::findByUserCode($user['code_user']);
        if (!$shop) {
            Response::error('Boutique introuvable', [], 404);
        }

        if (!Abonnement::isActive($shop['code_boutique'])) {
            $dejaAbonne = Abonnement::findByBoutique($shop['code_boutique']);
            if ($dejaAbonne) {
                Response::error('Votre période d\'essai est terminée', ['code' => 'SUBSCRIPTION_EXPIRED'], 402);
            }
            Response::error('Abonnement requis pour continuer', ['code' => 'SUBSCRIPTION_REQUIRED'], 402);
        }

        return $user;
    }

    protected function periodRange(string $period, string $dateStartInput = '', string $dateEndInput = ''): array
    {
        $period = strtolower(trim($period));
        if ($period === 'custom') {
            $start = preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateStartInput) ? $dateStartInput : date('Y-m-d');
            $end = preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateEndInput) ? $dateEndInput : date('Y-m-d');
            if ($start > $end) {
                [$start, $end] = [$end, $start];
            }
            return [$start, $end, 'custom'];
        }
        if ($period === 'week') {
            return [date('Y-m-d', strtotime('-6 days')), date('Y-m-d'), 'week'];
        }
        if ($period === 'month') {
            return [date('Y-m-01'), date('Y-m-t'), 'month'];
        }
        if ($period === 'year') {
            return [date('Y-01-01'), date('Y-12-31'), 'year'];
        }
        return [date('Y-m-d'), date('Y-m-d'), 'today'];
    }
}
