<?php

namespace app\v2\validate;

use think\Validate;
use app\v2\model;

class ClassPlan extends Validate {

    protected $rule = [
        'plan_id' => 'checkUserCount|checkPlanId',
        'start_time' => 'require|checkStartTime',
        'end_time' => 'require|checkEndTime',
        'coach_user_id' => 'require|checkCoach',
    ];
    protected $message = [
        'plan_id.checkUserCount' => '该时间段已被人预约，无法操作',
        'plan_id.checkPlanId' => '时间已超过，无法操作',
        'start_time.require' => '上课开始时间必填',
        'start_time.checkStartTime' => '时间已过,不能排课',
        'end_time.require' => '上课结束时间必填',
        'end_time.checkEndTime' => '上课结束时间必须大于开始时间',
        'coach_user_id.require' => '请选择教练',
        'coach_user_id.checkCoach' => '该教练这个时间段已有其他排课',
    ];
    protected function checkUserCount($value, $rule, $data) {
        if($value>0){
            $classPlan = model\ClassPlan::get($value);
            if(!$classPlan){
                return false;
            }
            if($classPlan['user_count']==1){
                return false;
            }
        }
        return true;
    }
    protected function checkStartTime($value, $rule, $data) {
        return strtotime($value) > get_now_time() + 60 * 5;
    }

    protected function checkEndTime($value, $rule, $data) {
        return strtotime($value) > strtotime($data['start_time']);
    }
    protected function checkCoach($value, $rule, $data) {
        $id = isset($data['plan_id']) ? $data['plan_id'] : 0;
        $model = new model\ClassPlan();
        return $model->checkPlanTime($data['mch_id'], $data['coach_user_id'], $data['start_time'], $data['end_time'], $id);
    }
    protected function checkPlanId($value, $rule, $data){
        if($value>0){
            $classPlan = model\ClassPlan::get($value);
            if($classPlan['start_time']<=get_now_time('Y-m-d H:i:s')){
                return false;
            }
        }
        return true;
    }
}
