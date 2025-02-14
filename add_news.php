<?php
include 'password.php';

$news_file = 'news.json';
$news_data = json_decode(file_get_contents($news_file), true);

$title = $_POST['title'];
$content = $_POST['content'];
$password = $_POST['password'];
$attachment = '';

if (!password_verify($password, $hashed_password)) {
    echo json_encode(['success' => false, 'message' => 'Password errata']);
    exit;
}

if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] == 0) {
    $targetDir = "uploads/";
    $targetFile = $targetDir . basename($_FILES["attachment"]["name"]);
    if (move_uploaded_file($_FILES["attachment"]["tmp_name"], $targetFile)) {
        $attachment = $targetFile;
    }
}

$new_news = array(
    'title' => $title,
    'content' => $content,
    'attachment' => $attachment,
    'date' => date('Y-m-d H:i:s')
);

$news_data[] = $new_news;
file_put_contents($news_file, json_encode($news_data));

$response = array('success' => true);
echo json_encode($response);
?>