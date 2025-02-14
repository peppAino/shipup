<?php
$news_file = 'news.json';
$news_data = json_decode(file_get_contents($news_file), true);
echo json_encode($news_data);
?>