<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018/4/17
 * Time: 19:19
 */

namespace app\v2\model;
use app\common\component\Code;

class SoldCardUser extends \app\common\model\SoldCardUser
{

    /*
     *  修改成员状态
     */
    public function lockUser($params,$user){

        $where = [];
        $where['user_id'] = ['IN',$params['users']];
        $where['sold_card_id'] = $params['sold_card_id'];

        //验证是否为主卡人
        $master = SoldCard::get(['sold_card_id' => $params['sold_card_id'],'user_id' => $user['user_id']]);
        if(!isset($master)){
            return error(Code::VALIDATE_ERROR,'只有主卡人才能进行此操作！');
        }

        $list = $this->where($where)->select();
        foreach($list as $val){
            $val->status = $params['status'];
            $res = $val->save();
            if ($res === false) {
                return error(Code::SAVE_DATA_ERROR);
            }
        }
        if($params['status'] == self::STATUS_LOCK){
            return success('锁定成功！');
        }
        return success('解锁成功！');
        
    }

}