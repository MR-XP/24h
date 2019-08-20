<?php

namespace app\common\model;

use think\Db;
use app\common\component\Code;

/**
 * 商户会员
 */
class Member extends Base {

    protected $table = 'mch_member';
    protected $insert = ['status' => 1, 'create_time'];

    public function setCreateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

    /**
     * 赠送金豆，谨慎调用此方法。
     * @param type $mchId
     * @param type $userId
     * @param type $num
     * @param type $managerId 操作员ID，系统自动赠送填写-1
     * @param type $params 附加参数，expire_time 字符串形式的过期时间，note备注
     */
    public function givePrePaid($mchId, $userId, $num, $managerId, $params = []) {
        Db::startTrans();
        try {
            $prePaid = $this->where("mch_id=$mchId and user_id=$userId")->lock(true)->value('pre_paid');
            if ($prePaid + $num < 0) {
                return error(Code::PARAM_ERROR);
            }
            $result = $this->where("mch_id=$mchId and user_id=$userId")->update(['pre_paid' => ['exp', 'pre_paid+' . $num]]);
            if (!$result) {
                return error(Code::SAVE_DATA_ERROR);
            }
            $log = [
                'mch_id' => $mchId,
                'user_id' => $userId,
                'num' => $num,
                'create_by' => $managerId,
            ];
            isset($params['note']) && $log['note'] = $params['note']; //备注
            isset($params['expire_time']) && $log['expire_time'] = $params['expire_time']; //过期时间
            $result = \app\common\model\PrePaid::create($log);
            if (!$result) {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
            Db::commit();
            return success($result);
        } catch (\Exception $e) {
            Db::rollback();
            return error(Code::VALIDATE_ERROR, $e->getMessage());
        }
    }

    //储值
    public function buyPrePaid($order) {
        Db::startTrans();
        try {
//          $num = $order['origin_price'] * $order['product_num'];
            $num = $order['origin_price'];
            $result = $this->where("mch_id={$order['mch_id']} and user_id= {$order['user_id']}")
                    ->setInc('pre_paid', $num);
            if ($result === false) {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
            //保存日志记录
            $log = new PrePaid();
            $result = $log->save([
                'mch_id' => $order['mch_id'],
                'user_id' => $order['user_id'],
                'num' => $num,
                'note' => '储值',
                'order_id' => $order['order_id'],
            ]);
            if ($result === false) {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
            Db::commit();
            return success('');
        } catch (\Exception $e) {
            Db::rollback();
            return error(Code::SAVE_DATA_ERROR);
        }
    }

// 消费
    public function payPrePaid($order) {
        Db::startTrans();
        try {
            $num = $order['price'] * $order['product_num'];
            $result = $this->where("mch_id={$order['mch_id']} and user_id= {$order['user_id']}")
                    ->setDec('pre_paid', $num);
            if ($result === false) {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
            //保存日志记录
            $log = new PrePaid();
            $result = $log->save([
                'mch_id' => $order['mch_id'],
                'user_id' => $order['user_id'],
                'num' => -$num,
                'note' => '消费',
                'order_id' => $order['order_id'],
            ]);
            if ($result === false) {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
            Db::commit();
            return success('');
        } catch (\Exception $e) {
            Db::rollback();
            return error(Code::SAVE_DATA_ERROR);
        }
    }

}
