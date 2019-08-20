<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018/7/23
 * Time: 16:38
 */

namespace app\v2\controller;
use app\v2\model;

class prize extends Base
{

    /*
     * 奖品加载
     */
    public function getList(){
        $limit = input('limit',8);
        $model = new model\Prize();
        return $model->getList($this->merchant['mch_id'],['limit' => $limit]);
    }

    /*
     * 抽奖
     */
    public function luckDraw(){
        $limit = input('limit',8);
        $model = new model\Prize();
        return $model->luckDraw($this->merchant['mch_id'],$this->user['user_id'],['limit' => $limit]);
    }

    /*
     * 中奖记录
     */
    public function myPrize(){
        $pageNo     = input('page_no',1);
        $pageSize   = input('page_size',$this->pageSize);
        $model      = new model\Prize();
        return $model->myPrize($this->merchant['mch_id'],$this->user['user_id'],[],$pageNo,$pageSize);
    }
}