<?php

namespace app\manager\controller;

use app\manager\model;
use app\manager\validate;
use app\common\component\Code;

/*
 * 签到
 */

class Sign extends Base {

    //获取列表
    public function getList() {
        $model = new model\Sign();
        $data = input('');
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        return $model->getList($this->mchId, $data, $pageNo, $pageSize);
    }
//签到统计
    public function signStatistics(){
        $model=new model\Sign();
        $mchid=$this->mchId;
        $phone=input('phone');
        $userModel=new model\User();
        if(!empty($phone)){
            $userId=$userModel->getUserByPhone($phone);
        }
        $order=input('order');

        $startTime=!empty(input('startTime'))?input('startTime'):'0000-00-00 00:00:00';
        $endTime=!empty(input('endTime'))?input('endTime'):get_now_time();
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);

        $row=$model->getsignStatistics($mchid,$userId,$startTime,$endTime,$pageNo,$pageSize,$order);
        return $row;
    }
}
