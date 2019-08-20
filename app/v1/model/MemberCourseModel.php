<?php

namespace app\v1\model;

class MemberCourseModel extends \app\common\model\SoldCourse {

    protected $mch_coach    = 'mch_coach';
    protected $mch_course   = 'mch_course';
    protected $sys_user     = 'sys_user';

    public function get_my_course_list($mchId,$params) {

        $where = ['c.mch_id' => $mchId, 'c.user_id' => $params['user_id'], 'c.status' => 1, 'c.type' => $params['type']];
        $field = "c.sold_course_id,c.course_id,c.course_name,c.coach_user_id,c.buy_num,c.use_num,c.expire_time,"
            . "e.cover,e.time,"
            . "u.real_name as coach_name";
        $list = $this->alias('c')
            ->join($this->sys_user . ' u', 'u.user_id = c.coach_user_id ')
            ->join($this->mch_course . ' e', 'e.course_id = c.course_id')
            ->field($field)
            ->where($where)
            ->where('buy_num>use_num')
            ->select();

        $Plan = new \app\common\model\ClassPlan();
        $time = get_now_time('Y-m-d H:i:s');

        foreach ($list as $val){

            $val['expire_type']=($val->expire_time > $time)?1:0;

            if($params['type']==3){                                 //私教时间段
                $coach = \app\common\model\Coach::get(['user_id' => $val['coach_user_id']]);
                $plan = $Plan->
                field("plan_id,course_id,start_time,end_time,type,DATE_FORMAT(start_time,'%Y-%m-%d') as group_time")
                    ->where([
                        'is_open'       => 1,
                        'status'        => 1,
                        'coach_user_id' => $val['coach_user_id'],
                        'type'          => 3,
                        'start_time'    =>  [
                            ['GT',date('Y-m-d H:i:s',time()+3600)],
                            ['LT',date('Y-m-d H:i:s',time()+86400*6)],
                            'AND'
                        ]
                    ])
                    ->order('start_time asc')
                    ->select();

                foreach ($plan as $sub){
                    $appt = Appointment::get([
                        'plan_id'    =>  $sub['plan_id'],
                        'plan_type'  =>  $sub['type'],
                        'status'    =>  self::STATUS_ENABLE
                    ]);
                    $appt?$sub['appt_status']=true:$sub['appt_status']=false;
                }
                $val['shops'] = $coach['shops'];
                $val['plan_time'] = $this->array_group($plan);
                unset($coach, $plan);
            }

            if($params['type'] == 2){
                $plan = $Plan->
                    where([
                        'is_open'       => 1,
                        'status'        => 1,
                        'course_id'     => $val['course_id'],
                        'type'          => Course::TYPE_GROUP,
                        'start_time'    =>  [
                            ['GT',date('Y-m-d H:i:s',time()+3600)],
                            ['LT',date('Y-m-d H:i:s',time()+86400*6)],
                            'AND'
                        ]
                    ])
                    ->select();
                $plan?$val['course_plan']=true:$val['course_plan']=false;
            }

        }

        return $list;
    }

    public function array_group($array) {
        $result = [];
        foreach ($array as $k => $v) {
            $result[$v['group_time']][] = $v;
        }
        return $result;
    }

}
