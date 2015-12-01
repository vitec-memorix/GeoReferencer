#!/usr/bin/php
<?php

foreach (scandir(__DIR__ . '/../images') as $filename) {
    $file = realpath(__DIR__ . '/../images/' . $filename);
    if (file_exists($file)) {
        if (filemtime($file) < (time() - 86400)) { // 24 hours ago
            if (preg_match('~(\w+)_geo_warp\.tiff~', $filename, $matches)) {
                $url = 'http://geoserver:8081/geoserver/rest/workspaces/Georeferencer/coveragestores/' . $matches[1] . '?recurse=true';
                $handle = curl_init($url);

                curl_setopt($handle, CURLOPT_CUSTOMREQUEST, 'DELETE');
                curl_setopt($handle,CURLOPT_RETURNTRANSFER,1);
                curl_setopt($handle, CURLOPT_USERPWD, 'admin:geoserver');
                curl_setopt($handle, CURLOPT_HTTPHEADER, array("Content-type: text/plain"));
                $response = curl_exec($handle);
                curl_close($handle);
            }
            unlink($file);
        }
    }
}