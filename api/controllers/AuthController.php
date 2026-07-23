<?php

require_once __DIR__ . '/../core/Controller.php';

class AuthController extends Controller
{
    public function login(): void
    {
        $phone = trim($this->input('phone', $this->input('telephone', '')));
        if (!$phone) {
            Response::error('Numéro de téléphone requis');
        }

        $user = User::findByPhone($phone);
        if (!$user) {
            Response::error('Utilisateur introuvable', [], 401);
        }

        $shop = Shop::findByUserCode($user['code_user']);

        Session::regenerate();

        $authToken = bin2hex(random_bytes(32));
        Session::set('auth_token', $authToken);

        Response::success('Connexion réussie', [
            'user' => $user,
            'shop' => $shop,
            'token' => $authToken,
        ]);
    }

    public function me(): void
    {
        $user = $this->requireAuth();
        $shop = Shop::findByUserCode($user['code_user']);
        Response::success('Utilisateur connecté', [
            'user' => $user,
            'shop' => $shop,
        ]);
    }

    public function logout(): void
    {
        Session::destroy();
        Response::success('Déconnexion réussie');
    }
}
