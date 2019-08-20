<?php

namespace app\v1\model;

class CoachApplication extends \app\common\model\CoachApplication {




    public function checkStatus($mch_id,$user_id,$status=0){
        $where=[];
        $where['mch_id']=$mch_id;
        $where['user_id']=$user_id;
        $where['status']=$status;
        $result=$this->where($where)->find();
        return $result;

    }

}
