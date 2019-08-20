<?php

namespace app\manager\model;
use app\common\component\Code;
use think\Db;
/**
 * 已出售的卡与用户关联
 */
class SoldCardUser extends \app\common\model\SoldCardUser {

    //添加成员并关联会员卡
    public function addMember($mchId,$params){
        $soldCard = SoldCard::get(['mch_id' => $mchId,'sold_card_id' => $params['sold_card_id']]);

        //验证会员卡
        if(!$soldCard){
            return error(Code::VALIDATE_ERROR,'没有查到有效会员卡！');
        }
        if($soldCard['active'] == 1){
            if(strtotime($soldCard['expire_time']) < time()){
                return error(Code::VALIDATE_ERROR,'会员卡已过期，无法再添加成员！');
            }
            if($soldCard['type'] == Card::TYPE_COUNT && $soldCard['times'] <= $soldCard['use_times']){
                return error(Code::VALIDATE_ERROR,'会员卡次数已使用完，无法再添加成员！');
            }
        }
        
        //创建用户
        $user = new User();
        $res = $user->addMember($mchId, $params);
        if(!$res){
            return error(Code::VALIDATE_ERROR,'会员添加失败！');
        }

        //验证会员卡所绑定的子成员
        $users = SoldCardUser::where(['mch_id' => $mchId,'sold_card_id' => $params['sold_card_id']])->column('user_id');
        if(in_array($res['data']['user_id'],$users)){
            return error(Code::VALIDATE_ERROR,'该会员已经是成员，不能重复添加！');
        }

        \think\Db::startTrans();
        $result = self::save([
            'sold_card_id'  =>  $params['sold_card_id'],
            'mch_id'        =>  $mchId,
            'user_id'       =>  $res['data']['user_id'],
            'is_default'    =>  0,      //1为默认使用，0为不默认
            'free'          =>  0,      //1为收费添加，0为免费添加
            'status'        =>  0,      //0为正常，1为锁定
        ]);
        if ($result === false) {
            \think\Db::rollback();
            return error(Code::SAVE_DATA_ERROR);
        }
        \think\Db::commit();
        return success('添加成功！');
    }

    //删除成员
    public function delSoldCardUser($mchId,$params){
        \think\Db::startTrans();
        $soldCardUser = SoldCardUser::where([
            'mch_id'        => $mchId,
            'sold_card_id'  => $params['sold_card_id'],
            'user_id'       => $params['user_id']
        ])->delete();
        if ($soldCardUser === false) {
            \think\Db::rollback();
            return error(Code::VALIDATE_ERROR,'删除失败!');
        }
        \think\Db::commit();
        return success('删除成员成功！');
    }

}
