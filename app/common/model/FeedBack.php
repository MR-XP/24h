<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace app\common\model;

class FeedBack extends Base {

    protected $table = "mch_feedback";
    protected $insert = ['create_time'];

    public function setCreateTimeAttr($val) {
        return get_now_time('Y-m-d H:i:s');
    }

    public function getUserAttr($val,$data){
        if(empty($val)){
            return [];
        }else{
            return User::where(['user_id' => $val])->field('user_id,real_name,sex')->find();
        }
    }
}
