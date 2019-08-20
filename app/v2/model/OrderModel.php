<?php

namespace app\v2\model;

use app\v2\model\CardModel;
use app\v2\model\CourseModel;
use think\Db;
use app\common\component\Code;

class OrderModel extends \app\common\model\Order {

    protected $log_pre_paid = 'log_pre_paid';

    public function add_order($data) {
        return $this->insertGetId($data);
    }

    /**
     * 订单列表
     * 
     */
    public function get_order_list($mchId, $user_id, $pay_status, $page) {
        $field = " order_id,product_id,type,create_time,price,product_info,pay_status";
        $where = ['mch_id' => $mchId, 'user_id' => $user_id, 'pay_status' => $pay_status, 'type' => ['<>', 4], 'status' => 1];
        $count = $this->where($where)->field($field)->order('create_time desc')->count();
        $limit = 10;
        $list_rows = ceil($count / $limit);
        $list['count'] = $count;
        $list['list_rows'] = $list_rows + 1;
        $list['page'] = $page;

        $list['data'] = db('sys_order')->where($where)->field($field)->order('create_time desc')->page($page, $limit)->select();

        if (!empty($list['data'])) {
            foreach ($list['data'] as $key => $val) {
                $pre_paid = db($this->log_pre_paid)->where(['order_id' => $val['order_id']])->find();
                $list['data'][$key]['price'] = $val['price'] - abs($pre_paid['num']);
//购卡
                if ($val['type'] == 1) {
                    $Card = new CardModel();
                    $card_info = $Card->get_card_info($mchId, $val['product_id']);
                    $list['data'][$key]['image'] = $card_info['image'];
                    $list['data'][$key]['goods_name'] = $card_info['card_name'];
                }
//购课
                if ($val['type'] == 2 || $val['type'] == 3) {
                    $Course = new Course();
                    $course_info = $Course->get(['course_id' => $val['product_id']]);
                    $list['data'][$key]['image'] = $course_info['cover'];
                    $list['data'][$key]['goods_name'] = $course_info['course_name'];
                }
//                // 储值
//                if ($val['type'] == 4) {
//                    $list['data'][$key]['image'] = $course_info['image'];
//                    $list['data'][$key]['goods_name'] = '储值';
//                }
            }
        }
        return $list;
    }

    public function order_cancel($order_id, $user_id) {
        $order = $this->where(['order_id' => $order_id, 'user_id' => $user_id, 'pay_status' => 0, 'status' => 1])->find();
        if (!$order) {
            return error(0, '订单不存在');
        }
        Db::startTrans();
        $result = $this->where(['order_id' => $order['order_id']])->update(['status' => -1]);
        if ($result === false) {
            Db::rollback();
            return error(Code::SAVE_DATA_ERROR);
        }
        $log = \app\common\model\PrePaid::get(['order_id' => $order_id]);
        if ($log) {
            // 删除记录
            $result = (new \app\common\model\PrePaid())->where(['pre_paid_id' => $log['pre_paid_id']])->delete();
            if ($result === false) {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
            //加豆
            $result = (new \app\common\model\Member())->where(['user_id' => $log['user_id']])->setInc('pre_paid', abs($log['num']));
            if ($result === false) {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
        }
        Db::commit();
        return success('');
    }

}
