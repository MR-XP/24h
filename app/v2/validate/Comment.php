<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace app\v2\validate;

use think\Validate;

/**
 * Description of Comment
 *
 * @author Administrator
 */
class Comment extends Validate {

    protected $rule = [
        'mch_id' => 'require',
        'rate' => 'require',
        'content' => 'require',
        'user_id' => 'require',
        'course_id' => 'require',
        'course_name' => 'require',
        'coach_user_id' => 'require',
        'appointment_id' => 'require',];
    protected $message = [
    ];

}
