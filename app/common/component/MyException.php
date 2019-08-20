<?php

/*
 * 错误处理
 */

namespace app\common\component;

use Exception;
use think\exception\Handle;
use think\exception\HttpException;
use think\Response;
use think\Log;

class MyException extends Handle {

    protected $ignoreReport = []; //不过滤http错误

    public function render(Exception $e) {
        if (\think\App::$debug) {
            return parent::render($e);
        } else {
            $response = Response::create(error($e->getCode(), config('error_message')), 'json');
            return $response;
        }
    }
    
}
