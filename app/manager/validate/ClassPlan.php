<?php

namespace app\manager\validate;

use think\Validate;
use app\manager\model;

class ClassPlan extends Validate {

    protected $rule = [
        'plan_id' => 'checkPlanId',
        'start_time' => 'require|checkStartTime',
        'end_time' => 'require|checkEndTime',
        'course_id' => 'checkCourse',
        'shop_id' => 'checkShop',
        'coach_user_id' => 'require|checkCoach',
    ];
    protected $message = [
        'plan_id.checkPlanId' => '该排课已经有预约',
        'start_time.require' => '上课开始时间必填',
        'start_time.checkStartTime' => '时间已过,不能排课',
        'end_time.require' => '上课结束时间必填',
        'end_time.checkEndTime' => '上课结束时间必须大于开始时间',
        'course_id.checkCourse' => '未找到课程',
        'shop_id.checkShop' => '请选择正确的场馆',
        'coach_user_id.require' => '请选择教练',
        'coach_user_id.checkCoach' => '该教练这个时间段已有其他排课',
    ];

    protected function checkCourse($value, $rule, $data) {
        if ($data['type'] == model\Course::TYPE_PRIVATE) { //私教不需要选择课程
            return true;
        } else {
            $where = [
                'course_id' => $value,
                'status' => model\Course::STATUS_ENABLE
            ];
            return model\Course::where($where)->count() > 0;
        }
    }

    protected function checkCoach($value, $rule, $data) {
        $id = isset($data['plan_id']) ? $data['plan_id'] : 0;
        $model = new model\ClassPlan();
        return $model->checkPlanTime($data['mch_id'], $data['coach_user_id'], $data['start_time'], $data['end_time'], $id);
    }

    protected function checkStartTime($value, $rule, $data) {
        return strtotime($value) > get_now_time() + 60 * 5;
    }

    protected function checkEndTime($value, $rule, $data) {
        return strtotime($value) > strtotime($data['start_time']);
    }

    //有预约了不能编辑
    protected function checkPlanId($value, $rule, $data) {
        if ($value > 0) {
            return model\Appointment::where('status=' . model\Appointment::STATUS_ENABLE . ' and plan_id=' . $value)->count() === 0;
        }

        return true;
    }

    protected function checkShop($value, $rule, $data) {
        if ($data['type'] == model\Course::TYPE_PRIVATE) { //私教不需要选择场馆
            return true;
        } else {
            $where = [
                'shop_id' => $value,
                'status' => model\Shop::STATUS_ENABLE
            ];
            return model\Shop::where($where)->count() > 0;
        }
    }

}
