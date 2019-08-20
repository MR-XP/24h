<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018/7/23
 * Time: 14:47
 */

namespace app\manager\controller;
use app\common\component\Code;
use app\manager\model;
use think\Db;

class Prize extends Base
{
    
    public function getList(){
        $data       = input('');
        $pageNo     = input('page_no',1);
        $pageSize   = input('page_size',$this->pageSize);
        $model      = new model\prize();
        return $model->getList($this->mchId,$data,$pageNo,$pageSize);
    }

    public function save(){
        $data           = input('');
        $data['mch_id'] = $this->mchId;
        $model          = new model\prize();
        $data['prize_id'] > 0 && $model->isUpdate(true);
        Db::startTrans();
        try{
            $result = $model->allowField(true)->data($data)->save();
            if ($result === false) {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
            Db::commit();
        }catch (\Exception $e){
            Db::rollback();
            return error(Code::SAVE_DATA_ERROR);
        }
        return success($model->getData());
    }

}