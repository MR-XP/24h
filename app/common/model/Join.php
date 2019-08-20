<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018/4/11
 * Time: 11:42
 */

namespace app\common\model;

class Join  extends Base
{
    protected $table = "mch_join";
    protected $insert = ['create_time','status' => 1];

    public function setCreateTimeAttr($val){
        return get_now_time('Y-m-d H:i:s');
    }

    //新增记录
    public function add($params){

        if(empty($params['name'])){
            return error(0,'缺少姓名');
        }
        if(empty($params['phone'])){
            return error(0,'缺少电话');
        }
        if(empty($params['province'])){
            return error(0,'未填写省级');
        }
        if(empty($params['city'])){
            return error(0,'未填写市级');
        }
        if (!preg_match("/1[23456789]{1}\d{9}$/", $params['phone'])) {
            return error(0, '手机号码错误');
        }

        //验证重复提交
        $phone = self::where(['phone' => $params['phone']])->count();
        if($phone >= 3){
            return error(0, '请不要多次重复提交！');
        }
        
        $res=$this->save($params);
        if ($res === false) {
             return error(0,'提交失败');
        }
        return success('提交成功！');
    }

}