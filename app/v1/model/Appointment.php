<?php

namespace app\v1\model;

use app\common\component\Code;

class Appointment extends \app\common\model\Appointment {

    public function getList($mchId, $params, $pageNo, $pageSize, $search = ['order' => 'create_time desc']) {
        $where = ['mch_id' => $mchId, 'user_id' => $params['user_id'], 'status' => self::STATUS_ENABLE];
        if ($params['appointment_status'] == 0) {
            $where['end_time'] = ['gt', get_now_time('Y-m-d H:i:s')];
        } else {
            $where['end_time'] = ['lt', get_now_time('Y-m-d H:i:s')];
        }
        $where['sign']=['neq',4];
        $totalResults = $this->where($where)->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $this->where($where)->page($pageNo, $pageSize)->order($search['order'])->select();
        foreach ($list as &$value) {
            $plan = ClassPlan::get($value['plan_id']);
            $value['can_cancel'] = $plan['is_lock'] == 0;
            $course = Course::get($plan['course_id']);
            $coachUser = User::get(['user_id' => $plan['coach_user_id']]);
            $value['course'] = $course;
            $plan['coach_phone'] = $coachUser['phone'];
            $plan['coach_avatar'] = $coachUser['avatar'];
            $value['plan'] = $plan;
            $value['shop'] = Shop::get($value['shop_id']);
            $value['start_time_text'] = date('H:i', strtotime($value['start_time']));
            $value['end_time_text'] = date('H:i', strtotime($value['end_time']));
        }
        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }

    public function getUserIdByPlanId($planId) {
        $where = [];
        $where['plan_id'] = $planId;
        $appointment = $this->where($where)->column('user_id');

        return $appointment;
    }

    /**
     * 根据appointment_id查询出课程详情
     */
    public function getCourseById($appointmentId) {
        if (empty($appointmentId)) {
            return false;
        }
        $where = [];
        $where['appointment_id'] = $appointmentId;
        $where['status'] = Appointment::STATUS_ENABLE;
        $field = [
            'start_time','end_time',
        ];
        $result = $this
                ->where($where)
                ->field($field)
                ->find();
        return $result;
    }

}
