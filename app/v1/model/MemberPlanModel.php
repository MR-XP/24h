<?php

namespace app\v1\model;

class MemberPlanModel extends \app\common\model\Appointment {

    protected $mch_class_plan = 'mch_class_plan';
    protected $mch_course = 'mch_course';
    protected $mch_shop = 'mch_shop';

    public function get_user_plan_list($mchId, $user_id, $plan_status, $page) {
        $where = " WHERE a.mch_id = {$mchId} AND a.user_id = {$user_id}  AND a.status =1 ";
        $count_where = ['mch_id' => $mchId, 'user_id' => $user_id, 'status' => 1];

        // 已完成
        if ($plan_status == 1) {
            $time = get_now_time('Y-m-d H:i:s');
            $where .= " AND a.sign != 0 && a.end_time < '{$time}' ";
            $count_where = ['sign' => ['<>', 0]];
        } else {
            $where .= ' AND a.sign = 0 ';
            $count_where = ['sign' => 0];
        }

        $count = $this->where($count_where)->count();
//        $page = $page;
        $limit = 10;
        $list_rows = ceil($count / $limit);
        $start = ($page - 1) * $limit;
        $list = [];
        $list['count'] = $count;
        $list['list_rows'] = $list_rows + 1;
        $list['page'] = $page;
        //预约列表
        $field = "a.appointment_id,p.plan_id,p.start_time,p.end_time,p.course_name,p.coach_name,p.coach_user_id,c.cover,a.cancel_from,a.status,a.sign,s.province,s.city,s.county,s.address";
        $sql = "SELECT {$field} FROM {$this->table } a LEFT JOIN  {$this->mch_class_plan} p ON a.plan_id = p.plan_id  LEFT JOIN  {$this->mch_course}  c ON p.course_id = c.course_id LEFT JOIN {$this->mch_shop} s ON p.shop_id = s.shop_id {$where} LIMIT {$start},{$limit}";
        $list['data'] = db()->query($sql);
        return $list;
    }

    /**
     * 获取已预约人数
     */
    public function get_plan_count($plan_id) {
        $where = ['plan_id' => $plan_id, 'status' => 1];
        return $this->where($where)->count();
    }

    //上课状态
    public function save_plan_sign($user_id, $id, $sign) {
        $where = ['user_id' => $user_id, 'appointment_id' => $id];
        $result = $this->where($where)->update(['sign' => $sign]);
    }

}
