<?php

namespace app\common\model;

/**
 * 手机验证码
 */
class VerifyCode extends Base {

    protected $table = 'sms_verify_code';
    protected $insert = ['create_time'];

    public function setCreateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

}
