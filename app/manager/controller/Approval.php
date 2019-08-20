<?php

namespace app\manager\controller;

use app\manager\model;
use app\manager\validate;
use app\common\component\Code;

/*
 * 代购
 */

class Approval extends Base {

    //获取列表
    public function getList() {
        $model = new model\Approval();
        $data = input('');
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        return $model->getList($this->mchId, $data, $pageNo, $pageSize);
    }

    //添加代购申请
    public function add() {
        $model = new model\Approval();
        $validate = new validate\Approval();
        $exceptField = ['create_at', 'create_time', 'dispose_user_id', 'dispose_time', 'approval_id']; //排除字段
        $data = $this->request->except($exceptField);
        $data['mch_id'] = $this->mchId;
        $data['create_at'] = $this->user['user_id'];
        $data['status'] = 0;

        //验证规则
        if (!$validate->scene('add')->check($data)) {
            return error(Code::VALIDATE_ERROR, $validate->getError());
        }

        //检查类型
        if ($data['type'] == model\Order::TYPE_BUY_CARD) {
            $card = model\Card::get($data['product_id']);
            $data['product_name'] = $card['card_name'] . ' * ' . $data['buy_num'];
        } elseif ($data['type'] == model\Order::TYPE_BUY_GROUP_COURSE || $data['type'] == model\Order::TYPE_BUY_PRIVATE_COURSE) {
            $course = model\Course::get($data['product_id']);
            $data['product_name'] = $course['course_name'] . ' * ' . $data['buy_num'];
        } elseif ($data['type'] == model\Order::TYPE_BUY_PRE_PAID) {
            $data['product_name'] = '预储值';
        }

        $data['price']=$data['price']*$data['buy_num'];

        //检查是否有优惠
        if(!empty($data['discount_money']) && is_numeric($data['discount_money'])){
            $data['price'] = $data['price'] - $data['discount_money'];
            if($data['price']<0)
                $data['price'] = 0;
        }

        $result = $model->data($data)->save();
        if ($result === false) {
            return error(Code::SAVE_DATA_ERROR);
        }
        return success($model->toArray());
    }

    //处理代购
    public function dispose() {
        $validate = new validate\Approval();
        $data = $this->request->param();
        $data['mch_id'] = $this->mchId;
        if (!$validate->scene('dispose')->check($data)) {
            return error(Code::VALIDATE_ERROR, $validate->getError());
        }
        $saveData = [
            'approval_id' => $data['approval_id'],
            'status' => $data['status'],
            'note' => isset($data['note']) ? $data['note'] : '',
            'dispose_user_id' => $this->user['user_id'],
            'dispose_time' => get_now_time('Y-m-d H:i:s'),
        ];
        $model = new model\Approval();
        return $model->dispose($saveData);
    }

    //直接赠送金豆
    public function givePrepaid() {
        $data = $this->request->param();
        $data['mch_id'] = $this->mchId;
        $model = new model\Member();
        $validate = new validate\GivePrePaid();
        if(!$validate->check($data)){
            return error(Code::VALIDATE_ERROR,$validate->getError());
        }
        $admin = session('admin');
        $params = [];
        if (isset($data['expire_time']) && strtotime($data['expire_time']) > get_now_time()) {
            $params['expire_time'] = $data['expire_time'];
        }
        isset($data['note']) && $params['note'] = $data['note'];
        return $model->givePrePaid($data['mch_id'], $data['user_id'], $data['num'], $admin['user_id'], $params);
    }

}
