<?php

require_once dirname(__DIR__) . '/api/core/Database.php';
require_once dirname(__DIR__) . '/api/core/Response.php';
require_once dirname(__DIR__) . '/api/models/User.php';
require_once dirname(__DIR__) . '/api/models/Shop.php';
require_once dirname(__DIR__) . '/api/models/Sale.php';
require_once dirname(__DIR__) . '/api/models/Expense.php';
require_once dirname(__DIR__) . '/api/controllers/AuthController.php';
require_once dirname(__DIR__) . '/api/controllers/DashboardController.php';
require_once dirname(__DIR__) . '/api/controllers/SaleController.php';
require_once dirname(__DIR__) . '/api/controllers/ExpenseController.php';
require_once dirname(__DIR__) . '/api/controllers/HistoryController.php';
require_once dirname(__DIR__) . '/api/controllers/ReportController.php';
require_once dirname(__DIR__) . '/api/controllers/SearchController.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

$routes = [
    'POST' => [
        '/api/auth/login' => [AuthController::class, 'login'],
        '/api/auth/logout' => [AuthController::class, 'logout'],
        '/api/sales' => [SaleController::class, 'store'],
        '/api/expenses' => [ExpenseController::class, 'store'],
        '/api/history/delete' => [HistoryController::class, 'delete'],
    ],
    'GET' => [
        '/api/auth/me' => [AuthController::class, 'me'],
        '/api/dashboard' => [DashboardController::class, 'index'],
        '/api/history' => [HistoryController::class, 'index'],
        '/api/reports' => [ReportController::class, 'index'],
        '/api/search' => [SearchController::class, 'search'],
    ],
];

if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$handler = $routes[$method][$uri] ?? null;

if (!$handler) {
    Response::error('Endpoint non trouvé', [], 404);
}

[$controllerClass, $action] = $handler;
$controller = new $controllerClass();
$controller->$action();
