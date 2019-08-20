<?php

namespace app\v2\model;

use app\common\component\Code;

class ClassPlan extends \app\common\model\ClassPlan {

    protected $mch_course = 'mch_course';
    protected $mch_shop = 'mch_shop';
    protected $mch_appointment = 'mch_appointment';

    const SIGN_OK = 1; //签到成功的状态

    //查询
    public function search($mchId, $params, $limit) {
        
        $where = [];
        if (!empty($params['start_time']) && !empty($params['end_time'])) {
            $where['a.start_time'] = ['gt', $params['start_time'] . ' 00:00:00'];
            $where['a.end_time'] = ['lt', $params['end_time'] . ' 23:59:59'];
        }else{
            $where['a.start_time'] = ['gt', get_now_time('Y-m-d') . ' 00:00:00'];
            $where['a.end_time'] = ['lt', date('Y-m-d',strtotime(get_now_time('Y-m-d'))+60*60*24*6).' 23:59:59'];
        }
        $where['a.status'] = self::STATUS_ENABLE;
        isset($params['type']) && $where['a.type'] = $params['type'];
        isset($params['shop_id']) && $where['a.shop_id'] = $params['shop_id'];
        !empty($params['province']) && $where['b.province'] = $params['province'];
        !empty($params['city']) && $where['b.city'] = $params['city'];
        $where['a.mch_id'] = $mchId;
        $this->alias('a')->join('mch_shop b', 'b.shop_id=a.shop_id')->where($where);
        $limit > 0 && $this->limit($limit);
        $result = $this->field('a.*')->select();
        $arr = [];
        foreach ($result as $value) {
            $value['image'] = Course::where(['course_id' => $value['course_id']])->value('cover');
            $value['shop'] = Shop::get($value['shop_id']);
            $arr[date('Y-m-d', strtotime($value['start_time']))][] = $value;
        }
        if (isset($params['type']) && $params['type'] == Course::TYPE_PUBLIC && !empty($params['longitude']) && !empty($params['latitude'])) { //公共课计算距离
            foreach ($arr as &$day) {
                $sort=[];
                foreach ($day as $key=>&$value) {
                    $value['distance'] = $this->getDistance($params['latitude'], $params['longitude'], $value['shop']['latitude'], $value['shop']['longitude']);
                    $sort[$key]=$value['distance'];
                }
                array_multisort($sort,SORT_ASC,$day);
            }
        }
        return $arr;
    }

    //排课推荐
    public function planRec($mchId,$user,$params){
        $where = [];
        $where['a.start_time'] = ['gt',get_now_time('Y-m-d').' 00:00:00'];
        $where['a.end_time']   = ['lt',date('Y-m-d',strtotime(date('Y-m-d'))+86400).' 23:59:59'];
        $where['a.status']     = self::STATUS_ENABLE;
        $where['a.mch_id']     = $mchId;
        $where['a.type']       = ['IN',[1,2]];          //只加载公共课和小团课
        !empty($params['shop_id']) && $where['a.shop_id'] = $params['shop_id'];

        //列表
        $this->alias('a')->join('mch_shop b', 'b.shop_id=a.shop_id')->where($where);
        $this->limit($params['limit']);
        $result = $this->field('a.*')->select();
        foreach ($result as $value) {
            $value['image'] = Course::where(['course_id' => $value['course_id']])->value('cover');
            $value['shop'] = Shop::get($value['shop_id']);
        }

        if (!empty($params['longitude']) && !empty($params['latitude'])) { //公共课和小团课计算距离
            $sort=[];
            foreach($result as $key=>$val){
                $val['distance'] = $this->getDistance($params['latitude'], $params['longitude'], $val['shop']['latitude'], $val['shop']['longitude']);
                $sort[$key]=$val['distance'];
            }
            array_multisort($sort,SORT_ASC,$result);
        }

        return $result;
    }

    private function getDistance($lat1, $lng1, $lat2, $lng2) {
        $radLat1 = deg2rad($lat1);
        $radLat2 = deg2rad($lat2);
        $radLng1 = deg2rad($lng1);
        $radLng2 = deg2rad($lng2);
        $a = $radLat1 - $radLat2;
        $b = $radLng1 - $radLng2;
        $s = 2 * asin(sqrt(pow(sin($a / 2), 2) + cos($radLat1) * cos($radLat2) * pow(sin($b / 2), 2))) * 6371;
        return round($s);
    }

    //教练中心约课时间
    public function getCourseTime($mchId, $userId, $userCount, $start_time, $end_time) {
        $where = [];
        $where['mch_id'] = $mchId;
        $where['coach_user_id'] = $userId;
        $where['is_open'] = 1;
        $where['type'] = 3;
        $where['status'] = ClassPlan::STATUS_ENABLE;
        $field = 'plan_id,start_time,end_time,user_count,status';
        $order = "start_time asc";
        !empty($start_time) && $where['start_time'] = ['egt', $start_time . ' 00:00:00'];
        !empty($end_time) && $where['end_time'] = ['elt', $end_time . ' 23:59:59'];
        !empty($userCount) && $where['user_count'] = $userCount;
        $courseTime = $this->where($where)->field($field)->order($order)->select();
        $arr = [];
        if ($courseTime) {
            foreach ($courseTime as $value) {
                $arr[date('Y-m-d', strtotime($value['start_time']))][] = $value;
            }
        }
        return $arr;
    }

    //查询教练的累计上课节数
    public function getCoachCount($mchId, $userId) {
        $where = [];
        $where['coach_user_id'] = $userId;
        $where['mch_id'] = $mchId;
        $where['status'] = 2;
        //1正常，2计算业绩（已上课），0取消
        $result = $this->where($where)->count();
        return $result;
    }

    //教练个人中心我的预约
    public function getCoachCourse($mchId, $userid, $data, $pageNo, $pageSize) {
        $userModel = new User();
        $appointmentModel = new Appointment();
        $where = [];
        $where['a.mch_id'] = $mchId;
        $where['a.coach_user_id'] = $userid;
        $where['a.status'] = ['IN',[self::STATUS_NORMAL,self::STATUS_COMPLETE]];
        if ($data['appointment_status'] == 0) {
            $where['a.end_time'] = ['gt', get_now_time('Y-m-d H:i:s')];
        } else {
            $where['a.end_time'] = ['elt', get_now_time('Y-m-d H:i:s')];
        }

        $field = [
            'a.course_name', 'a.start_time', 'a.end_time', 'a.plan_id', 'a.user_count', 'a.type', 'a.max_count', 'a.min_count','a.coach_sign_time','a.coach_sign_out_time',
            'd.cover',
            'e.address', 'e.shop_name', 'e.province', 'e.city', 'e.county',
        ];
        $this->alias('a')
             ->join('mch_course d', 'd.course_id=a.course_id')
             ->join('mch_shop e', 'e.shop_id=a.shop_id')
             ->where($where);
        $query = clone $this->getQuery();
        $totalResults = $this->count();
        $totalPages = ceil($totalResults / $pageSize);

        if ($data['appointment_status'] == 0) {
           $order = $query->page($pageNo, $pageSize)->field($field)->select();
        } else {
           $order = $query->page($pageNo, $pageSize)->field($field)->order('a.end_time desc')->select();
        }

        $list = [];
        if ($order) {
            foreach ($order as $key => &$value) {
                if ($value['user_count'] > 0) {
                    $value['users'] = [];
                    $value['appointment'] = $appointmentModel->getUserIdByPlanId($value['plan_id']);
                    if ($value['appointment']) {
                        $string = implode(',', $value['appointment']);
                        $user = $userModel->getUserById($string);
                        if ($user) {
                            $value['users'] = $user;
                        }
                    }
                    $list[] = $value;
                }
            }
        }
        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }
    
    //教练个人中心我的预约会员
    public function getMakeUser($mchId,$data){

        //查询预约
        $appts = Appointment::all(['plan_id' => $data['plan_id'],'status' => Appointment::MAKE_BY_SELF,'mch_id' => $mchId]);
        
        //查询会员
        $userId=[];
        foreach($appts as $key => $val){
           $userId[$key]=$val->user_id;
        }
        $where['user_id'] = ['IN',$userId];
        $field='user_id,username,real_name,sex,phone,avatar';
        
        $list=[];
        $list['list']  = User::where($where)->field($field)->select();
        
        
        foreach($appts as $key => $val){
           $list['list'][$key]['sign_time']=$val->sign_time;
           $list['list'][$key]['sign']=$val->sign;
        }
        //查询该排课
        $course = self::get($data['plan_id']);
        //查询课程图片
        $course['course_id'] = self::get($data['plan_id'])->course_id;
        $course['cover']=Course::get($course['course_id'])->cover;
        $list['course'] = $course;
        //查询场馆
        $list['shop'] = Shop::get($course->shop_id);
        
        //获取预约总数
        $list['count'] = User::where($where)->count();
        return success($list);
        
    }

    //课程的不同上课状态的所有参课人数
    public function totalAttendClass($condition)
    {
        $where['b.sign'] = $condition['status'];
        $where['a.plan_id'] = $condition['plan_id'];

        $this->alias('a')
            ->join('mch_appointment b', 'b.plan_id=a.plan_id', 'left')
            ->where($where);
        $query = $this->getQuery();
        $result = $query->select();
        return count($result);
    }

    //可以预约的课程
    public function appointmentClassPlan($params)
    {
        $where = [];
        if (!empty($params['start_time']) && !empty($params['end_time'])) {
            $where['a.start_time'] = ['gt', $params['start_time'] . ' 00:00:00'];
            $where['a.end_time'] = ['lt', $params['end_time'] . ' 23:59:59'];
        }

        $where['a.type'] = $params['type'];
        $where['a.is_open'] = 1;
        $where['a.shop_id'] = $params['shop_id'];

        $this->alias('a')
            ->join('mch_shop b', 'b.shop_id=a.shop_id', 'left')
            ->field('a.course_name,a.coach_name,b.shop_name')
            ->order('a.create_time')
            ->where($where);

        $query = clone $this->getQuery();
        $list = $query->select();
        return success([
            'list' => $list
        ] );

    }

}
