<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018/4/17
 * Time: 19:14
 */

namespace app\v2\controller;
use app\v2\model;

class SoldCardUser extends Base {

    //查询该会员卡下成员
    public function getMember(){

        $model = new model\SoldCardUser;
        $data = input('');
        if(isset($data['sold_card_id'])){
            return $model->getMember($data);
        }else{
            return error(0,'没有查询条件！');
        }

    }

    //验证本人是否持有效卡
    public function searchCard(){
        $mchId  =   $this->merchant['mch_id'];
        $member =   $this->member;
        $model  =   new model\SoldCardUser();
        return $model->searchCard($mchId,$member);
    }

    //锁定成员
    public function lockUser(){
        $data = input('');
        $model =new model\SoldCardUser();
        if(empty($data['sold_card_id'])){
           return error(0,'请选择会员卡ID');
        }
        if(empty($data['users'])){
           return error(0,'请选择成员');
        }
        if(!isset($data['status'])){
            return error(0,'请选择锁定状态');
        }
        return $model->lockUser($data,$this->user);
    }

    //查询有效卡
    public function findCard(){
        $data = input('');
        $model = new model\SoldCard();
        return $model->getDefaultCard($this->merchant['mch_id'],$data['shop_id'],$data['user_id']);
    }
}