<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018/4/26
 * Time: 16:58
 */

namespace app\manager\controller;

use app\manager\model;

class Reply extends Base
{
    public function index(){

        $data = input('');
        $data['from_id']  = $this->user['user_id'];
        $data['mch_id']   = $this->mchId;
        $Reply = new model\Reply();
        return $Reply->add($data);

    }
    
}