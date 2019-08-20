<?php

namespace app\v1\model;

use app\common\component\Code;
use think\Db;

class Member extends \app\common\model\Member {

    /**
     * 组合支付，先去掉所有金豆
     * @param type $order
     * @return type
     */
    public function clearPrePaid($order) {
        Db::startTrans();
        try {
            $member = $this->where(['mch_id' => $order['mch_id'], 'user_id' => $order['user_id']])->lock(true)->find();
            if ($member['pre_paid'] >= $order['price']) {
                return error(Code::VALIDATE_ERROR, '参数错误，请重试！');
            }
            $prePaid = $member['pre_paid'];
            $prePaidModel = new PrePaid();
            $result = $prePaidModel->save([
                'mch_id' => $order['mch_id'],
                'note' => '支付',
                'num' => -$prePaid,
                'user_id' => $order['user_id'],
                'order_id' => $order['order_id'],
            ]);
            if ($result === false) {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
            $member['pre_paid'] = 0;
            $result = $member->save();
            if ($result === false) {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
            Db::commit();
            return success($prePaid);
        } catch (\Exception $e) {
            Db::rollback();
            return error(Code::SAVE_DATA_ERROR);
        }
    }

}
