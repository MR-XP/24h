<?php

namespace app\v2\validate;

use think\Validate;

class PrePaid extends Validate {

    protected $rule = [
        'price' => 'require',
        'num' => 'require|integer',];
    protected $message = [
        'price.require' => '价格不能为空',
        'num.require' => '数量不能为空',
        'num.integer' => '输入错误',
    ];

}
