<?php

namespace app\manager\model;

use app\common\component\Code;
use app\common\model;

/**
 * 排课
 */
class ClassPlan extends \app\common\model\ClassPlan {
    /**
     * @param $mchId
     * @param $params
     * @param $limit
     * @return array
     */
    public function search($mchId, $params, $limit) {
        $where = [];
        if (!empty($params['start_time']) && !empty($params['end_time'])) {
            $where['start_time'] = ['gt', $params['start_time'] . ' 00:00:00'];
            $where['end_time'] = ['lt', $params['end_time'] . ' 23:59:59'];
        }

        //默认加载所有状态
        $where['status'] = ['IN',[0,1,2]];

        isset($params['type']) && $where['type'] = $params['type'];
        isset($params['shop_id']) && $where['shop_id'] = $params['shop_id'];
        !empty($params['coach_user_id']) && $where['coach_user_id'] = $params['coach_user_id'];
        $where['mch_id'] = $mchId;
        $this->where($where);
        $limit > 0 && $this->limit($limit);
        $result = $this->select();
        load_relation($result, 'shop');
        $arr = [];
        foreach ($result as $value) {
            $value['appointments'] = Appointment::with('user')->where([ 
                
                    'mch_id'        =>  $value['mch_id'],
                    'plan_id'       =>  $value['plan_id'],
                    'cancel_from'   =>  ['neq',model\Appointment::CANCEL_BY_SELF]
                    
            ])->order('create_time desc')->group('user_id')->select();
            $arr[date('Y-m-d', strtotime($value['start_time']))][] = $value;
        }
        return $arr;
    }
    /**
     * @param $mchId
     * @param $course_id
     * @return array
     */
    public function classPlanByCourse($mchId, $course_id) {
        $where = [];
        $where['mch_id'] = $mchId;
        $where['course_id'] = $course_id;
        $field = "plan_id";
        $result = $this->where($where)->field($field)->select();
        if (!$result) {
            return error(0, '不好意思，数据出错');
        }
        return success($result);
    }
    /**
     * 财务统计总销量
     */
    public function statisticsSales($mchId, $params) {
        $where['a.mch_id'] = $mchId;
        $where['a.status']=self::STATUS_COMPLETE;
        $where['a.type']=self::TYPE_BUY_PRIVATE_COURSE;
        !empty($params['shop_id']) && $where['a.shop_id'] = $params['shop_id'];
        if (isset($params['start_time']) && isset($params['end_time'])) {
            $where['a.start_time'] = [['gt', $params['start_time']], ['lt', $params['end_time']]];
        }
        $result =$this->alias('a')
            ->join('mch_course b','a.course_id=b.course_id')
            ->where($where)
            ->sum('b.price');
        $result || $result = 0;
        return intval($result);
    }
    /**
     * 私教耗课列表
     */
    public function consumeList($mchId, $params, $pageNo, $pageSize){
        $couserModel=new Course();
        $userModel=new User();
        $where = ['a.mch_id' => $mchId];
        $where['a.status'] = self::STATUS_COMPLETE;
        $where['a.type'] = self::TYPE_BUY_PRIVATE_COURSE;
        !empty($params['shop_id']) && $where['a.shop_id'] = $params['shop_id'];
        $where['b.status'] = Course::STATUS_ENABLE;
        if (isset($params['start_time']) && isset($params['end_time'])) {
            $where['a.start_time'] = [['gt', $params['start_time']], ['lt', $params['end_time']]];
        }

        $this->alias('a')
            ->join('mch_course b', 'b.course_id=a.course_id', 'left')
            ->join('sys_user c','b.coach_user_id=c.user_id','right')
            ->where($where);
        $query = clone $this->getQuery();
        $totalResults = $this->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $query->page($pageNo, $pageSize)->select();
        if($list){
            foreach ($list as $k=>&$v){
                $arr[$v['coach_user_id']][]['price'] = $couserModel->where('coach_user_id',$v['coach_user_id'])->page($pageNo, $pageSize)->sum('price');
            }
        }

        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }
    /**
     * 私教耗课详情
     */
    public function classDetails($mchId,$data){
        $userModel=new User();
        $where=[];
        if(!empty($data['shop_id'])){
            $where['a.shop_id']=$data['shop_id'];
        }
        $where['a.mch_id']=$mchId;
        if (isset($data['start_time']) && isset($data['end_time'])) {
            $where['a.end_time'] = [['gt', $data['start_time']], ['lt', $data['end_time']]];
        }
        $where['a.status']=self::STATUS_COMPLETE;
        $where['a.type']=self::TYPE_BUY_PRIVATE_COURSE;
        $filed=[
            'a.course_name','a.coach_user_id','a.coach_name',
            'c.real_name','c.phone','c.avatar','c.sex'
        ];
        $result=$this->alias('a')
                ->where($where)
                ->join('mch_appointment b','a.plan_id=a.plan_id')
                ->join('sys_user c','b.user_id=b.user_id')
                ->field($filed)
                ->select();
        if($result){
            foreach ($result as $key=>&$value){
                $value['coach']=$userModel->where('user_id',$value['coach_user_id'])->field('real_name,avatar,phone,sex')->find();
            }

        }
        return success($result);

    }
    public function getUsedSoldCourse($shopId, $userId) {
        $where = ['a.status' => 2, 'a.coach_user_id' => $userId, 'a.type' => Course::TYPE_PRIVATE];
        $shopId > 0 && $where['a.shop_id'] = $shopId;
        $list = $this->alias('a')
                    ->join('mch_sold_course b', 'b.sold_course_id=a.sold_course_id')
                    ->where($where)
                    ->field('a.plan_id,b.*')
                    ->select();
        return $list;
    }
}
