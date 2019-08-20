<?php

namespace app\v1\controller;

use app\v1\model;
use app\v1\validate;
use app\common\component\Code;

/**
 * 优惠券
 */
class Coupon extends Base {

    public function getList() {
        $model = new model\CouponUser();
        $data = $this->request->param();
        return success($model->getList($this->merchant['mch_id'], $this->user['user_id'], $data));
    }

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
