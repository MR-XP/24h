<?php

namespace app\v2\model;

use app\common\component\Code;

class User extends \app\common\model\User {

    public function getUserInfo($mchId,$userId){
        $where=[];
        $where['user_id']=$userId;
        $userInfo=$this->where($where)->find();
        return $userInfo;
    }
    public function getUserById($string){
        $where=[];
        $where['user_id']=array('in',$string);
        $users=$this->where($where)->select();

        return $users;
    }
}
