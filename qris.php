<?php
// Endpoint penyedia gambar QRIS Style Coffe & Style Food
$sourcePath = 'C:/Users/BTI02/.gemini/antigravity-ide/brain/1c93f8b8-7096-4909-b79b-5b1b87cdc790/.user_uploaded/media_1788917624613.jpg';
$localJpg = __DIR__ . '/qris.jpg';

if (file_exists($sourcePath)) {
    @copy($sourcePath, $localJpg);
    header('Content-Type: image/jpeg');
    header('Cache-Control: public, max-age=86400');
    readfile($sourcePath);
    exit;
} elseif (file_exists($localJpg)) {
    header('Content-Type: image/jpeg');
    readfile($localJpg);
    exit;
} else {
    http_response_code(404);
    echo "QRIS Image not found.";
}
