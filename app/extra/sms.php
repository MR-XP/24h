<?php

/**
 * 短信配置文件
 */
return [
    'sender' => 'app\common\component\sms\YunTongXun',
    'app\common\component\sms\YunTongXun' => [
        'server_ip' => 'app.cloopen.com',
        'server_port' => '8883',
        'soft_version' => '2013-12-26',
        'log_path' => RUNTIME_PATH . 'log/yuntongxun/',
        'account_sid' => '8a216da85bd184ce015be256dfe4063c',
        'auth_token' => '7c48a2a4737c41a593fcb342a6286fa1',
        'app_id' => '8aaf07085bd180c4015be5c653f90664',
        'app_token' => '936041561f92c2fd8f48464a43269a63',
        'enabe_log' => false,
        'default_tpl_id' => '178790'//默认短信文件
    ]
];
