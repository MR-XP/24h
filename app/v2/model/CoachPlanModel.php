<?php

namespace app\v2\model;

class CoachPlanModel extends \app\common\model\ClassPlan {

    protected $mch_shop = "mch_shop";
    protected $mch_course = "mch_course";
    protected $mch_coach = "mch_coach";
    protected $sys_user = "sys_user";

    /**
     * 课程列表
     */
    public function get_paln_list($mchId,$shop_id) {
        $time = get_now_time('Y-m-d');
        $where = ['p.status' => 1, 'p.is_open' => 1, 'p.type' => 1, 'p.shop_id' => $shop_id, 'p.start_time' => ['GT', $time], 'c.status' => 1];
        $field = " p.* ,DATE_FORMAT(p.start_time,'%Y-%m-%d') as group_time,"
                . "s.province,s.city,s.county,s.address,"
                . "c.cover";
        $list = $this->alias('p')->join($this->mch_shop . ' s', 's.shop_id = p.shop_id')->join($this->mch_course . ' c', 'c.course_id = p.course_id ')->field($field)->where($where)->order('p.start_time asc')->select();

        if (!empty($list)) {
            foreach ($list as $k => $v) {
                if (strtotime($v['start_time'] < time()) || $v['max_count'] - $v['user_count'] < 1) {
                    //不可预约
                    $list[$k]['status'] = 0;
                }
            }
        } 
        return $this->array_group($list);
    }

    /*
     * 获取课程信息
     */

    public function get_plan_info($mchId, $plan_id) {
        $where = ['p.plan_id' => $plan_id, 'p.status' => 1];
        $field = "p.*,"
                . "e.intro as course_intro,e.images,"
                . "s.province,s.city,s.county,s.address,"
                . "h.speciality,h.intro as coach_intro,"
                . "u.avatar,u.phone";
        $plan = $this->alias('p')->join($this->mch_coach . ' h', 'h.user_id = p.coach_user_id')
                        ->join($this->mch_course . ' e', 'e.course_id = p.course_id')
                        ->join($this->sys_user . ' u', 'u.user_id = p.coach_user_id')
                        ->join($this->mch_shop . ' s', 's.shop_id = p.shop_id')
                        ->field($field)->find();
        $plan['images'] = json_decode($plan['images'], true);
        return $plan;
    }

    public function array_group($array) {
        $result = [];
        foreach ($array as $k => $v) {
            $result[$v['group_time']][] = $v;
        }
        return $result;
    }

}
