<?php

namespace app\v2\model;

use app\common\component\Code;

class Appointment extends \app\common\model\Appointment {

    public function getList($mchId, $params, $pageNo, $pageSize, $search = ['order' => 'create_time desc']) {

        $where = [
            'mch_id'    => $mchId,
            'user_id'   => $params['user_id'],
            'status'    => self::STATUS_ENABLE,
            'end_time'  => ['ELT',date('Y-m-d H:i:s')]
        ];
        !empty($params['sign']) && $where['sign'] = $params['sign'];
        
        //未完成记录
        if($params['sign'] == self::SIGN_TYPE_YES_USER){
            $where['end_time'] = ['GT',date('Y-m-d H:i:s')];
        }

        $list = $this->where($where)
                    ->page($pageNo, $pageSize)
                    ->order($search['order'])->select();
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

        $totalResults = $this->where($where)->count();
        $totalPages = ceil($totalResults / $pageSize);
        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);

    }

    public function getMyMake($mchId,$user,$params, $search = ['order' => 'start_time asc']){
        $where = ['mch_id' => $mchId, 'user_id' => $user['user_id'], 'status' => self::STATUS_ENABLE];
        if(!empty($params['start_time']) && !empty($params['end_time'])){
            $where['start_time'] = [
              ['EGT',$params['start_time'].' 00:00:00'],
              ['ELT',$params['end_time'].' 23:59:59'],
              'AND'
            ];
        }
        $list = $this->where($where)
                    ->order($search['order'])
                    ->select();
        $arr = [];
        foreach ($list as $val) {
            $plan = ClassPlan::get($val['plan_id']);
            $val['can_cancel'] = $plan['is_lock'] == 0;
            $course = Course::get($plan['course_id']);
            $coachUser = User::get(['user_id' => $plan['coach_user_id']]);
            $val['course'] = $course;
            $plan['coach_phone'] = $coachUser['phone'];
            $plan['coach_avatar'] = $coachUser['avatar'];
            $val['plan'] = $plan;
            $val['shop'] = Shop::get($val['shop_id']);
            $val['start_time_text'] = date('H:i', strtotime($val['start_time']));
            $val['end_time_text'] = date('H:i', strtotime($val['end_time']));
            $arr[date('Y-m-d', strtotime($val['start_time']))][] = $val;
        }
        return $arr;
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
