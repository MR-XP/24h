<?php

namespace app\v2\model;

use app\common\component\Code;


class Course extends \app\common\model\Course {

    /*
     * 获取课程列表
     */
    public function getList($mchId,$params){

        //场馆条件
        $where = ['status' => Shop::STATUS_ENABLE, 'mch_id' => $mchId];
        !empty($params['province']) && $where['province'] = $params['province'];
        !empty($params['city']) && $where['city'] = $params['city'];
        !empty($params['shop_id']) && $where['shop_id'] = $params['shop_id'];
        $shops = Shop::where($where)->column('shop_id');

        //课程条件
        $where = [
            'a.status' => self::STATUS_ENABLE,
            'a.mch_id' => $mchId
        ];
        !empty($params['type']) && $where['a.type'] = $params['type'];
        !empty($params['course_id']) && $where['a.course_id'] = $params['course_id'];

        $order = [
            'a.sort'        =>  'desc',
            'a.create_time' =>  'desc'
        ];
        $field = ['a.*'];
        $this->alias('a');

        if(!empty($params['type']) && $params['type'] != Course::TYPE_PUBLIC){
            $this->join('mch_coach b','b.user_id = a.coach_user_id');
            $where['b.status'] = self::STATUS_ENABLE;
        }

        $this->group('course_id')
             ->where($where)
             ->field($field)
             ->order($order);
        $result = $this->select();

        $list = [];
        
        //教练查询
        if(!empty($params['type']) && $params['type'] != Course::TYPE_PUBLIC){
            foreach ($result as $val){
                $coach = Coach::get(['user_id' => $val->coach_user_id]);
                $user  = User::get(['user_id' => $val->coach_user_id]);
                $data  = [];
                $data['speciality'] = explode(',',$coach['speciality']);
                $data['intro']      = $coach['intro'];
                $data['images']     = $coach['images'];
                $data['tag']        = $coach['tag'];
                $data['score']      = $coach['score'];
                $data['shops']      = $coach->getData('shops');
                $data['avatar']     = $user['avatar'];
                $data['real_name']  = $user['real_name'];
                $data['sex']        = $user['sex'];
                $data['phone']      = $user['phone'];
                $data['birthday']   = $user['birthday'];
                $data['user_id']    = $user['user_id'];
                $val['coach']   = $data;
                $val['service'] = $coach['shops'];
            }

            //筛选教练服务的场馆
            if($shops){
                foreach ($result as $key => $val) {
                    $arr    = explode(',', $val->coach['shops']);
                    $count  = count($arr);
                    foreach($arr as $key => $num){
                        $arr[$key] = intval($num);
                        if(($key+1) == $count){
                            if (array_intersect($arr, $shops)) {
                                $list[] = $val->toArray();
                            }
                        }
                    }
                }
            }else{
                $list = $result;
            }
        }else{
                $list = $result;
        }

        //可预约时间
        foreach($list as $key => $val){
            $where = [
                'start_time'    =>  [
                    ['GT',date('Y-m-d H:i:s',time()+3600)],
                    ['ELT',date('Y-m-d H:i:s',time()+3600+3600*24*6)],
                    'AND'
                ],
                'mch_id'        => $val['mch_id'],
                'type'          => $val['type'],
                'status'        => self::STATUS_ENABLE,
                'is_lock'       => 0,                   //未锁定状态
                'is_open'       => 1,                   //开放预约
                'user_count'    => 0                    //无人预约状态
            ];
            $order = ['start_time' => 'asc'];
            $plan = ClassPlan::where($where)
                             ->where("(course_id = {$val['course_id']} and (type = 1 or type = 2)) or (coach_user_id = {$val['coach_user_id']} and type = 3)")
                             ->order($order)
                             ->column('start_time');
            $list[$key]['times'] = $plan;
        }

        //加载条数
        if(!empty($params['limit'])){
            $list = array_slice($list,0,$params['limit']);
        }
        return $list;
    }

    /*
     * 获取教练课程列表
     */
    public function getCoachCourse($mchId,$userId){
        $where=[];
        $where['coach_user_id']=$userId;
        $where['mch_id']=$mchId;
        $where['type']=3;
        $course=$this->where($where)->select();
        return success($course);
    }

    /**
     * 获取课程详情
     */
    public function getCourseDetail($mchId,$courseId,$planId,$latitude='',$longitude=''){
        $shopModel=new Shop();
        $where=[];
        $where['a.mch_id']=$mchId;
        $where['a.course_id']=$courseId;
        $where['b.plan_id']=$planId;
        $field=[
            'a.cover','a.course_name','a.min_buy','a.expire_day','a.price','a.intro','a.time',
            'b.plan_id','b.start_time','b.end_time',
            'c.real_name',
            'd.shops'
        ];
        $courseDetail=$this->alias('a')
            ->where($where)
            ->join('mch_class_plan b','b.course_id=a.course_id')
            ->join('sys_user c','c.user_id=a.coach_user_id')
            ->join('mch_coach d','d.user_id=a.coach_user_id')
            ->field($field)
            ->find();
        if(!$courseDetail){
            return error('0','没查到该课程详情');
        }
        else{
            $courseDetail['shop']=$shopModel->getShopAddress($courseDetail['shops'],$latitude,$longitude);
            $courseDetail['serviceNum']=count(explode(',',$courseDetail['shops']));
        }
        return success($courseDetail);
    }

    
    public function getCourseSign($courseId){
        $where=[];
        $where['course_id']=$courseId;
        $fields=[
            'a.*',
            'b.shops'
        ];
        $result=$this->alias('a')
            ->join('mch_coach b','b.user_id=a.coach_user_id')
            ->where($where)->field($fields)->find();
        $result['shops']=count( explode(',',$result['shops']));
        return success($result);
    }
}
