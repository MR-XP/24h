<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018/5/18
 * Time: 16:45
 */

namespace app\index\controller;

use app\common\model;

class Saleman extends Base
{

    /*
     * 销售人员查询
     */
    public function search(){
        $model = new model\Saleman();
        $data = input('');
        $data['status'] = model\Saleman::SALEMAN_STATUS_ON;    //默认正常状态销售人员
        $limit = input('limit',0);
        return json(success($model->search($this->merchant['mch_id'],$data,$limit)));
    }

}