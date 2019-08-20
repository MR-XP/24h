<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018/6/14
 * Time: 15:06
 */

namespace app\v2\controller;

use app\common\component\Code;
use app\v2\model;
use think\Request;

class BodyData extends Base{

    /*
     * 数据报表
     */
    public function dataCount(){
       $model = new model\BodyData();
       return success($model->dataCount($this->merchant['mch_id'],$this->user));
    }

    /*
     * 跑步排行
     */
    public function runRankings(){
        $limit = input('limit',10);
        $model = new model\BodyData();
        return success($model->runRankings($this->merchant['mch_id'],$this->user,$limit));
    }

    /*
     * 跑步记录
     */
    public function runRecord(){
        $data = input('');
        $model = new model\BodyData();
        return success($model->runRecord($this->merchant['mch_id'],$this->user,$data));
    }
}