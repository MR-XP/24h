<?php

namespace app\manager\validate;

use think\Validate;
use app\common\model\Course;

class MemberNote extends Validate {

    protected $rule = [
        'user_id' => 'require',
        'content' => 'require',
    ];
    protected $message = [
        'user_id.require' => '用户未知',
        'content.require' => '请填写内容',
    ];

}
