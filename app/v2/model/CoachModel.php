<?php

namespace app\v2\model;

class CoachModel extends \app\common\model\Coach {

    protected $sys_user = "sys_user";
    protected $mch_shop = "mch_shop";
    protected $mch_course = "mch_course";
    protected $mch_class_plan = "mch_class_plan";

    public function get_coach_list($mchId, $speciality, $shop_Id, $sex, $sort_key, $sort,$province='',$city='') {
        $classPlan=new ClassPlan();
        $where=['status'=>Shop::STATUS_ENABLE];
        !empty($province) && $where['province']=$province;
        !empty($city) && $where['city']=$city;
        !empty($shop_Id) && $where['shop_id']=$shop_Id;
        $shops = Shop::where($where)->column('shop_id');
        $where = ['h.status' => 1];
        if (!empty($speciality)) {
            $where['h.speciality'] = ['like', "%{$speciality}%"];
        }
        if (!empty($sex)) {
            $where['u.sex'] = $sex;
        }
        $field = "h.coach_id,h.speciality,h.score,h.user_id,h.mch_id,"
                . "u.real_name as coach_name,u.avatar, h.shops";
        $coachs = $this->alias('h')
                ->join($this->sys_user . ' u', 'u.user_id = h.user_id')
                ->field($field)
                ->where($where)
                ->select();
        if(!empty($coachs)){
            foreach ($coachs as $k=>$v) {
            $arr = explode(',',$v->getData('shops'));
                if(!array_intersect($arr,$shops)){
                    $coachs=json_decode(json_encode($coachs),true);
                    unset($coachs[$k]);
                }
            $v['count']=$classPlan->getCoachCount($v['mch_id'],$v['user_id']);
            $v['speciality'] = explode(',', $v['speciality']);
            $v['price'] = $this->get_course_price($v['user_id']);
            $v['buy_num'] = $this->get_course_sold($v['user_id']);
        }
            if (!empty($sort_key) && !empty($sort)) {
                $coachs = $this->array_sort($coachs, $sort_key, $sort);
            }
        }
        return $coachs;

    }

    public function get_coach_info($mchId, $coachId) {

        $classPlan=new ClassPlan();
        $where = ['h.coach_id' => $coachId, 'h.status' => 1];
        $field = "h.*,"
                . "u.real_name as coach_name,u.phone,u.avatar";
        $info = $this->alias('h')
                ->join($this->sys_user . ' u', 'u.user_id = h.user_id')
                ->field($field)
                ->where($where)
                ->find();
        $info['speciality'] = explode(',', $info['speciality']);
        //        $info['speciality'] = json_decode($info['speciality'], true);
        //排课时间
        $plans = $this->alias('h')
                ->join($this->mch_class_plan . ' p', 'p.coach_user_id = h.user_id')
                ->field("p.start_time,p.end_time,DATE_FORMAT(p.start_time,'%Y-%m-%d') as group_time,p.user_count")
                ->where(['p.type' => 3, 'p.start_time' => ['>', get_now_time() + 60 * 5], 'p.status' => 1, 'p.is_open' => 1, 'h.coach_id' => $coachId])
                ->select();
        $info['plan'] = $this->array_group($plans);
        //课程
        $info['course'] = (new \app\common\model\Course())
                        ->where(['coach_user_id' => $info['user_id'], 'type' => 3, 'status' => 1])->select();
        //评价
        $info['comment'] = (new CommentModel())->get_coach_comment($mchId, $info['user_id']);
        //查询教练的累计上课节数
        $info['count']=$classPlan->getCoachCount($mchId, $info['user_id']);
        return $info;
    }

    public function get_course_price($user_id) {
        $data = (new \app\common\model\Course())->field('price')->where(['status' => 1, 'type' => 3, 'coach_user_id' => $user_id])->order('price asc')->find();
        return $data['price'];
    }

    public function get_course_sold($coach_id) {

        $data = (new \app\common\model\SoldCourse())->field("sum(buy_num) as buy_num")->where(['status' => 1, 'type' => 3, 'coach_user_id' => $coach_id])->find();
        if (empty($data['buy_num'])) {
            $data['buy_num'] = 0;
        }
        return $data['buy_num'];
    }

    public function array_sort($array, $field, $type) {
        $fieldArr = array();
        foreach ($array as $k => $v) {
            $fieldArr[$k] = $v[$field];
        }
        if ($type == 'asc') {
            $sort = SORT_ASC;
        } elseif ($type == 'desc') {
            $sort = SORT_DESC;
        } else {
            
        }
        array_multisort($fieldArr, $sort, $array);
        return $array;
    }

    public function array_group($array) {
        $result = [];
        foreach ($array as $k => $v) {
            $result[$v['group_time']][] = $v;
        }
        return $result;
    }

}
