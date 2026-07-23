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
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;

        if (session_status() !== PHP_SESSION_ACTIVE) {
            Session::start();
        }

        if ($authHeader && preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
            $token = trim($matches[1]);

            if (preg_match('/^[a-f0-9]{64}$/', $token)) {
                if (isset($_SESSION['auth_token']) && $_SESSION['auth_token'] === $token && isset($_SESSION['user'])) {
                    return $_SESSION['user'];
                }

                $rawSessionDir = session_save_path() ?: sys_get_temp_dir();
                $sessionDir = rtrim(str_replace(['\\', '/'], '/', $rawSessionDir), '/');
                $maxAge = time() - 86400 * 30;

                foreach (glob($sessionDir . '/sess_*') as $sessionFile) {
                    if (filemtime($sessionFile) < $maxAge) {
                        continue;
                    }

                    $content = @file_get_contents($sessionFile);
                    if ($content !== false && str_contains($content, 'auth_token|s:64:"' . $token . '";')) {
                        $sessionId = substr(basename($sessionFile), 5);

                        if ($sessionId !== session_id()) {
                            session_write_close();
                            session_id($sessionId);
                            if (session_status() === PHP_SESSION_NONE) {
                                session_start();
                            }
                        }

                        if (isset($_SESSION['user'])) {
                            error_log('[AUTH] Token OK session=' . $sessionId . ' user=' . ($_SESSION['user']['code_user'] ?? ''));
                            return $_SESSION['user'];
                        }
                        error_log('[AUTH] Token found but no user in session=' . $sessionId);
                        break;
                    }
                }
                error_log('[AUTH] Token not found in any session file');
            } else {
                error_log('[AUTH] Invalid token format');
            }

            Response::error('Non autorisé', [], 401);
        }

        $sid = session_id();
        $hasUser = isset($_SESSION['user']);
        error_log('[AUTH] Cookie fallback session=' . $sid . ' hasUser=' . ($hasUser ? 'yes' : 'no'));

        if ($hasUser) {
            return $_SESSION['user'];
        }

        Response::error('Non autorisé', [], 401);
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
