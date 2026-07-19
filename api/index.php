<?php

require_once __DIR__ . '/core/Database.php';
require_once __DIR__ . '/core/Response.php';
require_once __DIR__ . '/models/User.php';
require_once __DIR__ . '/models/Shop.php';
require_once __DIR__ . '/models/Sale.php';
require_once __DIR__ . '/models/Expense.php';
require_once __DIR__ . '/models/Forfait.php';
require_once __DIR__ . '/models/Abonnement.php';
require_once __DIR__ . '/models/Product.php';
require_once __DIR__ . '/models/Purchase.php';
require_once __DIR__ . '/models/SaleLine.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/DashboardController.php';
require_once __DIR__ . '/controllers/SaleController.php';
require_once __DIR__ . '/controllers/ExpenseController.php';
require_once __DIR__ . '/controllers/HistoryController.php';
require_once __DIR__ . '/controllers/ReportController.php';
require_once __DIR__ . '/controllers/SearchController.php';
require_once __DIR__ . '/controllers/DeveloperController.php';
require_once __DIR__ . '/controllers/SubscriptionController.php';
require_once __DIR__ . '/controllers/ProductController.php';
require_once __DIR__ . '/controllers/PurchaseController.php';
require_once __DIR__ . '/controllers/StockController.php';
require_once __DIR__ . '/controllers/SaleLineController.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

$scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
$parentDir = dirname($scriptDir);

if ($parentDir !== '/' && strpos($uri, $parentDir) === 0) {
    $uri = substr($uri, strlen($parentDir));
}

if ($uri === '' || $uri[0] !== '/') {
    $uri = '/' . $uri;
}

$routes = [
    'POST' => [
        '/api/auth/login' => [AuthController::class, 'login'],
        '/api/auth/logout' => [AuthController::class, 'logout'],
        '/api/sales' => [SaleController::class, 'store'],
        '/api/expenses' => [ExpenseController::class, 'store'],
        '/api/history/delete' => [HistoryController::class, 'delete'],
        '/api/abonnements' => [SubscriptionController::class, 'subscribe'],
        '/api/dev/users' => [DeveloperController::class, 'createUser'],
        '/api/dev/shops' => [DeveloperController::class, 'createShop'],
        '/api/dev/forfaits' => [DeveloperController::class, 'createForfait'],
        '/api/dev/abonnement/statut' => [DeveloperController::class, 'setAbonnementStatut'],
        '/api/dev/abonnements' => [DeveloperController::class, 'createAbonnement'],
        '/api/products' => [ProductController::class, 'store'],
        '/api/products/toggle' => [ProductController::class, 'toggleStatut'],
        '/api/products/delete' => [ProductController::class, 'delete'],
        '/api/purchases' => [PurchaseController::class, 'store'],
        '/api/purchases/delete' => [PurchaseController::class, 'delete'],
        '/api/purchases/update' => [PurchaseController::class, 'update'],
        '/api/sale-lines' => [SaleLineController::class, 'store'],
        '/api/sale-lines/update' => [SaleLineController::class, 'update'],
        '/api/sale-lines/delete' => [SaleLineController::class, 'delete'],
    ],
    'GET' => [
        '/api/auth/me' => [AuthController::class, 'me'],
        '/api/dashboard' => [DashboardController::class, 'index'],
        '/api/history' => [HistoryController::class, 'index'],
        '/api/reports' => [ReportController::class, 'index'],
        '/api/search' => [SearchController::class, 'search'],
        '/api/forfaits' => [SubscriptionController::class, 'listForfaits'],
        '/api/dev/users' => [DeveloperController::class, 'listUsers'],
        '/api/dev/user-detail' => [DeveloperController::class, 'userDetail'],
        '/api/dev/shops' => [DeveloperController::class, 'listShops'],
        '/api/dev/shop-detail' => [DeveloperController::class, 'shopDetail'],
        '/api/dev/forfaits' => [DeveloperController::class, 'listForfaitsDev'],
        '/api/dev/abonnements' => [DeveloperController::class, 'listAbonnements'],
        '/api/products' => [ProductController::class, 'index'],
        '/api/purchases' => [PurchaseController::class, 'index'],
        '/api/stock' => [StockController::class, 'index'],
        '/api/sale-lines' => [SaleLineController::class, 'index'],
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
