<?php

namespace app\v1\model;

class CoachInfo extends \app\common\model\Coach {
        /**
         * 判断是否为教练
         */
        public function isCoach($user_id,$mchId){
            $where=[];
            $where['a.user_id']=$user_id;
            $where['a.mch_id']=$mchId;
            $info=$this->alias('a')
                ->join('sys_user b','b.user_id=a.user_id')
                ->where($where)
                ->field('a.*,b.user_id,b.real_name,b.avatar')
                ->find();
            $data = (new \app\common\model\SoldCourse())->field("sum(buy_num) as buy_num")->where(['status' => 1, 'coach_user_id' => $user_id])->find();
            if (empty($data['buy_num'])) {
                $data['buy_num'] = 0;
            }
           $info['orderCount']= intval($data['buy_num']);
            return success($info);
        }
        /**
         * 教练的我的相册
         */
        public function getcoachImage($mchId,$userId){
            $where=[];
            $where['mch_id']=$mchId;
            $where['status']=self::STATUS_ENABLE;
            $where['user_id']=$userId;
            $list=$this->where($where)->field('images,coach_id')->find();
            return $list;
        }

}
