<?php

namespace app\v2\validate;

use think\Validate;
use app\v2\model;

/**
 * 预约验证
 */
class Appointment extends Validate {

    protected $rule = [
        'plan_id' => 'require',
        'shop_id' => 'require',
        'course_id' => 'require',
        'appointment_id' => 'require|checkAppointment',
    ];
    protected $message = [
        'appointment_id.require' => '请选择一个预约',
        'appointment_id.checkAppointment' => '该预约已经不能取消',
    ];
    protected $scene = [
        'make' => ['plan_id', 'user_id'],
        'cancel' => ['appointment_id', 'user_id'],
    ];

    protected function checkAppointment($value, $rule, $data) {
        $appointment = model\MemberPlanModel::get($value);
        if (!$appointment) {
            return false;
        }
        if (strtotime($appointment['start_time']) < get_now_time() - 60 * 60) { //60分钟以内不能取消
            return false;
        }
        return true;
    }

}
