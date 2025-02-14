<?php
include 'password.php';

$news_file = 'news.json';
$news_data = json_decode(file_get_contents($news_file), true);

$input = json_decode(file_get_contents('php://input'), true);
$index = $input['index'];
$password = $input['password'];

if (!password_verify($password, $hashed_password)) {
    echo json_encode(['success' => false, 'message' => 'Password errata']);
    exit;
}

if (isset($news_data[$index])) {
    array_splice($news_data, $index, 1);
    file_put_contents($news_file, json_encode($news_data));
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'News non trovata']);
}
?>