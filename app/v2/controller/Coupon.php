<?php

namespace app\v2\controller;

use app\v2\model;
use app\v2\validate;
use app\common\component\Code;

/**
 * 优惠券
 */
class Coupon extends Base {

    //加载优惠劵列表
    public function getList() {
        $model = new model\CouponUser();
        $data = $this->request->param();
        return success($model->getList($this->merchant['mch_id'], $this->user['user_id'], $data));
    }

    //加载订单可以使用的优惠劵
    public function getListByOrder(){
        $data   = input('');
        $model  = new model\CouponUser();
        return success($model->getListByOrder($data));
    }

    //赠送优惠劵
    public function give() {
        $data = $this->request->param();
        $data['mch_id'] = $this->merchant['mch_id'];
        $data['user_id'] = $this->user['user_id'];
        $validate = new validate\Coupon();
        if (!$validate->scene('give')->check($data)) {
            return error(Code::VALIDATE_ERROR, $validate->getError());
        }
        $member = model\Member::get(['phone'=>$data['phone']]);
        $coupon = model\CouponUser::get($data['coupon_user_id']);
        if($member['user_id']== $this->member['user_id']){
            return error(Code::VALIDATE_ERROR,'不能转送给自己');
        }
        $coupon['from_user_id']=$coupon['user_id'];
        $coupon['user_id']=$member['user_id'];
        $result = $coupon->save();
        if($result!==false){
            return success($result);
        }else{
            return error(Code::SAVE_DATA_ERROR);
        }
    }

}
