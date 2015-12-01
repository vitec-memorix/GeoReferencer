<?php

define('APPROOT', dirname(__DIR__));

chdir(APPROOT);

$autoloader = include 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php';

$app = new \Georeferencer\Application\Micro(
    include_once (APPROOT . DIRECTORY_SEPARATOR . 'config/config.php')
);

$app->getApplication()->handle();