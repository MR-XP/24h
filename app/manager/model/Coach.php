<?php

namespace app\manager\model;

use app\common\component\Code;

/**
 * 教练
 */
class Coach extends \app\common\model\Coach {
    /**
     * @param $mchId
     * @param $params
     * @param $pageNo
     * @param $pageSize
     * @param array $search
     * @return array
     */

    public function getList($mchId, $params, $pageNo, $pageSize, $search = ['order' => 'a.create_time desc']) {
        $where = [];
        !empty($params['real_name']) && $where['b.real_name'] = array('like', "%{$params['real_name']}%");
        !empty($params['phone']) && $where['b.phone'] = array('like', "%{$params['phone']}%");
        !empty($params['type']) && $where['a.type'] = $params['type'];
        !empty($params['shop_id']) && $where['a.shop_id'] = $params['shop_id'];
        (isset($params['status']) && $params['status'] != '') && $where['a.status'] = $params['status'];
        isset($params['sex']) && $where['b.sex'] = $params['sex'];
        $where['a.mch_id'] = $mchId;
        $totalResults = $this->alias('a')->join('sys_user b', 'a.user_id=b.user_id')->where($where)->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $this->alias('a')->join('sys_user b', 'a.user_id=b.user_id')->where($where)
                        ->field('a.*,a.shop_id as shop_name,b.user_id,b.real_name,b.avatar,b.sex,b.phone')
                        ->page($pageNo, $pageSize)->order($search['order'])->select();
        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }

    /**
     * @param $mchId
     * @param $params
     * @param $limit
     * @return false|\PDOStatement|string|\think\Collection
     */
    public function search($mchId, $params, $limit) {
        $where = [];
        !empty($params['keyword']) && $where['b.real_name|b.phone'] = array('like', "%{$params['keyword']}%");
        isset($params['status']) && $where['a.status'] = $params['status'];
        $where['a.mch_id'] = $mchId;
        $this->alias('a')->join('sys_user b', 'a.user_id=b.user_id')->where($where);
        $limit > 0 && $this->limit($limit);
        $result = $this->select();
        return $result;
    }
    /**
     * 私教耗课列表
     */
    public function consumeList($mchId, $params, $pageNo, $pageSize){
        $classPlanModel=new ClassPlan();
        $courseModel=new Course();
        $this->where("a.status=".self::STATUS_ENABLE);
        $this->where("a.mch_id={$mchId}");
        if(isset($params['shop_id'])&&!empty($params['shop_id'])){
            $this->where("find_in_set({$params['shop_id']},a.shops)");
        }
        $field=[
            'c.real_name','a.user_id','c.avatar'
        ];
        $this->alias('a')
            ->join('sys_user c','a.user_id=c.user_id','left');
        $query = clone $this->getQuery();
        $totalResults = $this->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $query->page($pageNo, $pageSize)->field($field)->select();
        if (isset($params['start_time']) && isset($params['end_time'])) {
            $where['end_time'] = [['gt', $params['start_time']], ['lt', $params['end_time']]];
        }
        $sort=[];
        if($list){
            foreach ($list as $k=>&$v){
                $v['classNum']=$classPlanModel->where($where)->where('status',ClassPlan::STATUS_COMPLETE)->where('coach_user_id',$v['user_id'])->count();
                $sqlWhere['b.end_time']=[['gt', $params['start_time']], ['lt', $params['end_time']]];
                $v['price']=$courseModel->alias('a')
                           ->join('mch_class_plan b','a.course_id=b.course_id')
                            ->where($sqlWhere)
                            ->where('a.status',Coach::STATUS_ENABLE)
                            ->where('b.status',ClassPlan::STATUS_COMPLETE)
                            ->where('b.coach_user_id',$v['user_id'])
                           ->sum('a.price');
                if(empty($v['price'])){
                    $v['price']=0;
                }
                $sort[$k]=$v['price'];
                if($params['time_type']!='all'){
                    $lastWhere['b.end_time']=[['gt', $params['last_start_time']], ['lt', $params['last_end_time']]];
                    $v['lastprice']=$courseModel->alias('a')
                        ->join('mch_class_plan b','a.course_id=b.course_id')
                        ->where($lastWhere)
                        ->where('a.status',Coach::STATUS_ENABLE)
                        ->where('b.status',ClassPlan::STATUS_COMPLETE)
                        ->where('b.coach_user_id',$v['user_id'])
                        ->sum('a.price');
                    if(empty($v['lastprice'])){
                        $v['lastprice']=0;
                    }
                }
                if($v['price']>$v['lastprice']){
                    $v['float']=1;
                }elseif($v['price']==$v['lastprice']){
                    $v['float']=2;
                }else{
                    $v['float']=3;
                }
            }
        }
        array_multisort($sort,SORT_DESC,$list);
        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }

}
