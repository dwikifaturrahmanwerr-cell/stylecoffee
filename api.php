<?php
/**
 * ====================================================================
 * KASIRPRO POS - MULTI-DEVICE CENTRAL DATA & AUTH SYNC API
 * STYLE COFFE & STYLE FOOD BANDUNG
 * Mendukung 1 akun dapat aktif di banyak device sekaligus (Laptop, HP, Tablet)
 * ====================================================================
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Device-Id');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0777, true);
}

// File storage paths
$files = [
    'users'        => $dataDir . '/users.json',
    'products'     => $dataDir . '/products.json',
    'transactions' => $dataDir . '/transactions.json',
    'stock_logs'   => $dataDir . '/stock_logs.json',
    'settings'     => $dataDir . '/settings.json',
    'held_orders'  => $dataDir . '/held_orders.json',
    'sessions'     => $dataDir . '/sessions.json',
];

// Helper to safely read JSON
function readJsonFile($path, $default = []) {
    if (!file_exists($path)) {
        return $default;
    }
    $content = @file_get_contents($path);
    if ($content === false || trim($content) === '') {
        return $default;
    }
    $data = json_decode($content, true);
    return is_array($data) ? $data : $default;
}

// Helper to safely write JSON with file lock
function writeJsonFile($path, $data) {
    $fp = @fopen($path, 'w');
    if ($fp) {
        if (flock($fp, LOCK_EX)) {
            fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            fflush($fp);
            flock($fp, LOCK_UN);
        }
        fclose($fp);
        return true;
    }
    return @file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) !== false;
}

// Default Seed Users (jika file belum ada)
$defaultUsers = [
    [
        'username' => 'kasir1',
        'name'     => 'Kasir Style Coffe',
        'role'     => 'kasir',
        'password' => '123456'
    ],
    [
        'username' => 'owner',
        'name'     => 'Bpk. Owner Style Coffe',
        'role'     => 'owner',
        'password' => 'owner123'
    ],
    [
        'username' => 'admin',
        'name'     => 'Admin Style Coffe',
        'role'     => 'admin',
        'password' => 'admin123'
    ]
];

// Inisialisasi seed jika baru pertama kali
if (!file_exists($files['users'])) {
    writeJsonFile($files['users'], $defaultUsers);
}

// Parse request
$action = isset($_GET['action']) ? $_GET['action'] : '';
$rawBody = @file_get_contents('php://input');
$body = json_decode($rawBody, true) ?: [];

switch ($action) {
    /**
     * 1. GET ALL DATA (Inisialisasi perangkat baru atau sinkronisasi)
     */
    case 'get_all':
        $users        = readJsonFile($files['users'], $defaultUsers);
        $products     = readJsonFile($files['products'], null);
        $transactions = readJsonFile($files['transactions'], null);
        $stockLogs    = readJsonFile($files['stock_logs'], null);
        $settings     = readJsonFile($files['settings'], null);
        $heldOrders   = readJsonFile($files['held_orders'], []);
        $sessions     = readJsonFile($files['sessions'], []);

        echo json_encode([
            'success'      => true,
            'server_time'  => date('c'),
            'users'        => $users,
            'products'     => $products,
            'transactions' => $transactions,
            'stock_logs'   => $stockLogs,
            'settings'     => $settings,
            'held_orders'  => $heldOrders,
            'active_devices_count' => count($sessions)
        ]);
        break;

    /**
     * 2. REGISTER USER BARU (Bisa langsung diakses dari Laptop & HP)
     */
    case 'register':
        $username = strtolower(trim($body['username'] ?? ''));
        $name     = trim($body['name'] ?? '');
        $role     = trim($body['role'] ?? 'kasir');
        $password = trim($body['password'] ?? '');

        if (!$username || !$password || !$name) {
            echo json_encode(['success' => false, 'message' => 'Data tidak lengkap']);
            exit;
        }

        $users = readJsonFile($files['users'], $defaultUsers);
        foreach ($users as $u) {
            if (strtolower($u['username']) === $username) {
                echo json_encode(['success' => false, 'message' => "Username '{$username}' sudah terdaftar di sistem!"]);
                exit;
            }
        }

        $newUser = [
            'username' => $username,
            'name'     => $name,
            'role'     => $role,
            'password' => $password,
            'created_at' => date('c')
        ];

        $users[] = $newUser;
        writeJsonFile($files['users'], $users);

        echo json_encode([
            'success' => true,
            'message' => "Pendaftaran berhasil! Akun '{$username}' sekarang dapat digunakan di semua laptop dan HP.",
            'user'    => $newUser,
            'users'   => $users
        ]);
        break;

    /**
     * 3. LOGIN & REGISTER DEVICE (Multi-Device Active Sessions)
     * Satu akun bisa login bersamaan di banyak perangkat tanpa bentrok
     */
    case 'login':
        $username = strtolower(trim($body['username'] ?? ''));
        $password = trim($body['password'] ?? '');
        $role     = trim($body['role'] ?? '');
        $deviceId = trim($body['device_id'] ?? ('dev_' . bin2hex(random_bytes(6))));
        $deviceInfo = trim($body['device_info'] ?? 'Unknown Device');

        $users = readJsonFile($files['users'], $defaultUsers);
        $matchedUser = null;

        foreach ($users as $u) {
            if (strtolower($u['username']) === $username) {
                $matchedUser = $u;
                break;
            }
        }

        if (!$matchedUser) {
            echo json_encode(['success' => false, 'message' => "Pengguna '{$username}' belum terdaftar di sistem!"]);
            exit;
        }

        if ($matchedUser['password'] !== $password) {
            echo json_encode(['success' => false, 'message' => 'Kata sandi yang Anda masukkan salah!']);
            exit;
        }

        if ($role && strtolower($matchedUser['role']) !== strtolower($role)) {
            echo json_encode(['success' => false, 'message' => "Hak akses tidak sesuai! Terdaftar sebagai '{$matchedUser['role']}'."]);
            exit;
        }

        // Catat active session untuk device ini
        $sessions = readJsonFile($files['sessions'], []);
        $sessionToken = bin2hex(random_bytes(24));

        // Perbarui / tambahkan sesi perangkat
        $sessions[$deviceId] = [
            'username'     => $username,
            'role'         => $matchedUser['role'],
            'device_id'    => $deviceId,
            'device_info'  => $deviceInfo,
            'token'        => $sessionToken,
            'last_active'  => date('c'),
            'ip'           => $_SERVER['REMOTE_ADDR'] ?? ''
        ];

        // Bersihkan sesi lama yang sudah lewat 7 hari
        $nowTs = time();
        foreach ($sessions as $dId => $s) {
            if (isset($s['last_active']) && ($nowTs - strtotime($s['last_active'])) > 7 * 86400) {
                unset($sessions[$dId]);
            }
        }
        writeJsonFile($files['sessions'], $sessions);

        echo json_encode([
            'success'       => true,
            'message'       => "Login multi-device berhasil untuk {$matchedUser['name']}!",
            'user'          => $matchedUser,
            'device_id'     => $deviceId,
            'session_token' => $sessionToken,
            'total_active_devices' => count($sessions)
        ]);
        break;

    /**
     * 4. SYNC STATE (Sinkronisasi produk, stok, transaksi antar perangkat)
     */
    case 'sync':
        $updatedData = [];

        // Update produk jika dikirim
        if (isset($body['products']) && is_array($body['products'])) {
            writeJsonFile($files['products'], $body['products']);
            $updatedData['products'] = true;
        }

        // Update transaksi jika dikirim
        if (isset($body['transactions']) && is_array($body['transactions'])) {
            writeJsonFile($files['transactions'], $body['transactions']);
            $updatedData['transactions'] = true;
        }

        // Update stok logs jika dikirim
        if (isset($body['stock_logs']) && is_array($body['stock_logs'])) {
            writeJsonFile($files['stock_logs'], $body['stock_logs']);
            $updatedData['stock_logs'] = true;
        }

        // Update settings jika dikirim
        if (isset($body['settings']) && is_array($body['settings'])) {
            writeJsonFile($files['settings'], $body['settings']);
            $updatedData['settings'] = true;
        }

        // Update held orders jika dikirim
        if (isset($body['held_orders']) && is_array($body['held_orders'])) {
            writeJsonFile($files['held_orders'], $body['held_orders']);
            $updatedData['held_orders'] = true;
        }

        // Kembalikan data server terbaru
        $allUsers        = readJsonFile($files['users'], $defaultUsers);
        $allProducts     = readJsonFile($files['products'], null);
        $allTransactions = readJsonFile($files['transactions'], null);
        $allStockLogs    = readJsonFile($files['stock_logs'], null);
        $allSettings     = readJsonFile($files['settings'], null);
        $allHeldOrders   = readJsonFile($files['held_orders'], []);
        $sessions        = readJsonFile($files['sessions'], []);

        // Update heartbeat device
        $devId = $_SERVER['HTTP_X_DEVICE_ID'] ?? ($body['device_id'] ?? '');
        if ($devId && isset($sessions[$devId])) {
            $sessions[$devId]['last_active'] = date('c');
            writeJsonFile($files['sessions'], $sessions);
        }

        echo json_encode([
            'success'      => true,
            'server_time'  => date('c'),
            'synced'       => $updatedData,
            'users'        => $allUsers,
            'products'     => $allProducts,
            'transactions' => $allTransactions,
            'stock_logs'   => $allStockLogs,
            'settings'     => $allSettings,
            'held_orders'  => $allHeldOrders,
            'active_devices_count' => count($sessions)
        ]);
        break;

    /**
     * 5. LOGOUT DEVICE
     */
    case 'logout':
        $deviceId = trim($body['device_id'] ?? '');
        if ($deviceId) {
            $sessions = readJsonFile($files['sessions'], []);
            if (isset($sessions[$deviceId])) {
                unset($sessions[$deviceId]);
                writeJsonFile($files['sessions'], $sessions);
            }
        }
        echo json_encode(['success' => true, 'message' => 'Device session removed']);
        break;

    default:
        echo json_encode([
            'success' => true,
            'service' => 'Style Coffe Multi-Device Sync API',
            'version' => '3.0',
            'status'  => 'online',
            'time'    => date('c')
        ]);
        break;
}
