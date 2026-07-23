<?php

require_once __DIR__ . '/core/Database.php';
require_once __DIR__ . '/core/App.php';
require_once __DIR__ . '/core/Session.php';
require_once __DIR__ . '/core/Response.php';

App::load(__DIR__ . '/config/app.php');
Session::start();

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
require_once __DIR__ . '/controllers/ClientController.php';
require_once __DIR__ . '/models/Client.php';
require_once __DIR__ . '/models/Supplier.php';
require_once __DIR__ . '/models/StockAdjustment.php';
require_once __DIR__ . '/controllers/SupplierController.php';
require_once __DIR__ . '/controllers/PdfController.php';

require_once __DIR__ . '/../vendor/autoload.php';

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
        '/api/sales/pay' => [SaleController::class, 'pay'],
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
        '/api/clients' => [ClientController::class, 'store'],
        '/api/clients/toggle' => [ClientController::class, 'toggleStatut'],
        '/api/clients/delete' => [ClientController::class, 'delete'],
        '/api/fournisseurs' => [SupplierController::class, 'store'],
        '/api/fournisseurs/toggle' => [SupplierController::class, 'toggleStatut'],
        '/api/fournisseurs/delete' => [SupplierController::class, 'delete'],
        '/api/purchases' => [PurchaseController::class, 'store'],
        '/api/purchases/delete' => [PurchaseController::class, 'delete'],
        '/api/purchases/update' => [PurchaseController::class, 'update'],
        '/api/purchases/pay' => [PurchaseController::class, 'pay'],
        '/api/sale-lines' => [SaleLineController::class, 'store'],
        '/api/sale-lines/update' => [SaleLineController::class, 'update'],
        '/api/sale-lines/delete' => [SaleLineController::class, 'delete'],
        '/api/stock/adjust' => [StockController::class, 'adjust'],
        '/api/purchase-lines' => [PurchaseLineController::class, 'store'],
        '/api/purchase-lines/update' => [PurchaseLineController::class, 'update'],
        '/api/purchase-lines/delete' => [PurchaseLineController::class, 'delete'],
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
        '/api/products/detail' => [ProductController::class, 'show'],
        '/api/clients' => [ClientController::class, 'index'],
        '/api/clients/detail' => [ClientController::class, 'show'],
        '/api/fournisseurs' => [SupplierController::class, 'index'],
        '/api/fournisseurs/detail' => [SupplierController::class, 'show'],
        '/api/purchases' => [PurchaseController::class, 'index'],
        '/api/purchases/detail' => [PurchaseController::class, 'detail'],
        '/api/purchases/list' => [PurchaseController::class, 'list'],
        '/api/stock' => [StockController::class, 'index'],
        '/api/stock/history' => [StockController::class, 'history'],
        '/api/stock/inventory' => [StockController::class, 'inventory'],
        '/api/stock/inventory-detail' => [StockController::class, 'inventoryDetail'],
        '/api/expenses' => [ExpenseController::class, 'index'],
        '/api/sales/detail' => [SaleController::class, 'detail'],
        '/api/sales/list' => [SaleController::class, 'list'],
        '/api/sales/pdf' => [PdfController::class, 'sale'],
        '/api/purchases/pdf' => [PdfController::class, 'purchase'],
        '/api/sale-lines' => [SaleLineController::class, 'index'],
        '/api/purchase-lines' => [PurchaseLineController::class, 'index'],
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
