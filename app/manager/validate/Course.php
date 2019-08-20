<?php

namespace app\manager\validate;

use think\Validate;

class Course extends Validate {

    protected $rule = [
        'course_name' => 'require|checkUnique:course_name',
        'coach_user_id' => 'checkCoach',
        'type' => 'require|in:1,2,3',
        'origin_price' => 'float',
        'price' => 'float|elt:origin_price',
        'cover' => 'require',
        'time' => 'require|number|gt:0',
        'expire_day' => 'number',
        'min_buy' => 'number',
        'max_buy' => 'number',
    ];
    protected $message = [
        'course_name.require' => '请填写课程名',
        'course_name.checkUnique' => '课程名已存在',
        'coach_user_id.checkCoach' => '请选择正确的教练',
        'type.require' => '请选择课程类型',
        'cover.require' => '请上传卡封面',
        'time.require' => '请填写课程时长',
    ];

    // 验证唯一性
    protected function checkUnique($value, $rule, $data) {
        return true;
        $where = [];
        $where[$rule] = $value;
        $where['mch_id'] = $data['mch_id'];
        $where['coach_user_id'] = $data['coach_user_id'];
        if (isset($data['course_id']) && $data['course_id'] > 0) {
            $where['course_id'] = array('neq', $data['course_id']);
        }
        return \app\manager\model\Course::where($where)->count() === 0;
    }

    protected function checkCoach($value, $rule, $data) {
        if ($data['type'] == \app\manager\model\Course::TYPE_PRIVATE) {
            $where = [];
            $where['user_id'] = $data['coach_user_id'];
            $where['status'] = \app\manager\model\Course::STATUS_ENABLE;
            $where['mch_id'] = $data['mch_id'];
            return \app\manager\model\Coach::where($where)->count() > 0;
        } else {
            return true;
        }
    }

}
