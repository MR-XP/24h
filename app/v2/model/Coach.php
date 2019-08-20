<?php

namespace app\v2\model;

class Coach extends \app\common\model\Coach {

    public function getCoachList($mchId, $params) {
        $where = ['status' => Shop::STATUS_ENABLE, 'mch_id' => $mchId];
        !empty($params['province']) && $where['province'] = $params['province'];
        !empty($params['city']) && $where['city'] = $params['city'];
        !empty($params['shop_id']) && $where['shop_id'] = $params['shop_id'];
        $shops = Shop::where($where)->column('shop_id');
        $where = ['a.status' => self::STATUS_ENABLE, 'mch_id' => $mchId];
        !empty($params['speciality']) && $where['a.speciality'] = ['like', "%{$params['speciality']}%"];
        !empty($params['sex']) && $where['b.sex'] = $params['sex'];
        $field = [
            'a.coach_id', 'a.speciality', 'a.score', 'a.user_id', 'a.mch_id', 'a.shops','a.type',
            'b.real_name as coach_name', 'b.avatar',
            '(select price from mch_course where mch_course.mch_id = ' . $mchId . ' and mch_course.status=1 and mch_course.type=3 and mch_course.coach_user_id = a.user_id order by price asc limit 1) as price',
            '(select sum(buy_num) from mch_sold_course where mch_sold_course.mch_id = ' . $mchId . ' and mch_sold_course.status=1 and mch_sold_course.type=3 and mch_sold_course.coach_user_id = a.user_id) as buy_num',
            '(select count(*) from mch_class_plan where mch_class_plan.mch_id=' . $mchId . ' and mch_class_plan.coach_user_id=a.user_id and mch_class_plan.status=2) as count'
        ];
        !empty($params['order']) || $params['order'] = 'buy_num desc';
        $list = $this->alias('a')->join('sys_user b', 'b.user_id=a.user_id')->where($where)->field($field)->order($params['order'])->select();
        $result = [];
        if($shops){
            foreach ($list as $key => $val) {
                $arr   = explode(',', $val->getData('shops'));
                $count = count($arr);
                foreach ($arr as $key => $num){
                    $arr[$key] = intval($num);
                    if(($key+1) == $count){
                        if (array_intersect($arr, $shops)) {
                            $val['speciality'] = explode(',', $val['speciality']);
                            $result[] = $val->toArray();
                        }
                    }
                }
            }
        }
        return $result;
    }
    /*
     * 私教推荐
     */
    public function coachRec($mchId,$params){

        //场馆条件
        $where = ['status' => Shop::STATUS_ENABLE, 'mch_id' => $mchId];
        !empty($params['province']) && $where['province'] = $params['province'];
        !empty($params['city']) && $where['city'] = $params['city'];
        !empty($params['shop_id']) && $where['shop_id'] = $params['shop_id'];
        $shops = Shop::where($where)->column('shop_id');

        //私教条件
        $where = [];
        $where['a.mch_id'] = $mchId;
        $where['a.status'] = Coach::STATUS_ENABLE;
        $where['a.type']   = 2;     //默认兼职教练
        $where['c.type']   = 3;     //默认私教售课
        $field = [
            'a.coach_id','a.speciality','a.intro','a.seniority','a.tag','a.score','a.mch_id','a.shops',
            'b.real_name','b.sex','b.height','b.weight','b.avatar',
            '(select count(*) from mch_class_plan where mch_class_plan.mch_id='.$mchId.' and mch_class_plan.coach_user_id=a.user_id and mch_class_plan.status=2 and mch_class_plan.type=3) as count',
            '(select sum(buy_num) from mch_sold_course where mch_sold_course.mch_id = ' . $mchId . ' and mch_sold_course.status=1 and mch_sold_course.type=3 and mch_sold_course.coach_user_id = a.user_id) as buy_num',
            '(select price from mch_course where mch_course.mch_id = ' . $mchId . ' and mch_course.status=1 and mch_course.type=3 and mch_course.coach_user_id = a.user_id order by price asc limit 1) as price',
        ];
        $this->alias('a')
            ->join('sys_user b','b.user_id = a.user_id')
            ->join('mch_sold_course c','c.coach_user_id = a.user_id');
        $this->group('a.coach_id');
        $this->where($where);
        $this->field($field);
        $this->order(['buy_num' => 'desc','a.score' => 'desc']);
        $list = $this->select();
        $result = [];
        if($shops){
            foreach ($list as $key => $val) {
                $arr   = explode(',', $val->getData('shops'));
                $count = count($arr);
                foreach ($arr as $key => $num){
                    $arr[$key] = intval($num);
                    if(($key+1) == $count){
                        if (array_intersect($arr, $shops)) {
                            $val['speciality'] = explode(',', $val['speciality']);
                            $result[] = $val->toArray();
                        }
                    }
                }
            }
        }
        if(!empty($params['limit'])){
            $result = array_slice($result,0,$params['limit']);
        }
        return $result;

    }

}
