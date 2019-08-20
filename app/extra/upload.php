<?php
/**
 * 上传配置文件
 */
return [
    'uploader' => 'app\common\component\upload\File', //上传类型
    'static_domain' => '/uploads/',
    'config' => [
        'size' => 1024*1024*10,
        'ext' => ['jpg', 'jpeg', 'png', 'gif'],
        'rule' => 'uniqid',
    ],
    'OSS\OssClient' => [
        'accessKeyId' => '',
        'accessKeySecret' => '',
        'endpoint' => '',
        'isCName' => '',
    ],
];
