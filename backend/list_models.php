<?php
$env = file_get_contents('.env');
preg_match('/GEMINI_API_KEY=(.*)/', $env, $matches);
$apiKey = trim($matches[1]);

$url = "https://generativelanguage.googleapis.com/v1beta/models?key=" . $apiKey;
$json = file_get_contents($url);
$res = json_decode($json, true);

foreach ($res['models'] as $m) {
    echo $m['name'] . "\n";
}
