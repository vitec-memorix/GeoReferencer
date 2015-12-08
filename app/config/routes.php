<?php
$configuration = [
    [
        'setHandler' => '\Georeferencer\Controller\IndexCtrl',
        'routes' => [
            'get' => [
                '/' => 'index'
            ],
            'options' => [
                '/{catch:(.*)}' => 'options'
            ]
        ]
    ],
    [
        'setHandler' => '\Georeferencer\Controller\GeoCtrl',
        'routes' => [
            'get' => [
                '/preview' => 'preview',
                '/search/historical/{search:([^?]+)}' => 'historicalSearch'
            ],
            'post' => [
                '/preview' => 'preview'
            ]
        ]
    ],
    [
        'setHandler' => '\Georeferencer\Controller\DownloadCtrl',
        'routes' => [
            'get' => [
                '/file/{id:([^?]+)}' => 'get',
                '/file/{id:([^?]+)}/{format:([^?]+)}' => 'get'
            ]
        ]
    ]
];

return $configuration;
