<?php

namespace app\manager\controller;

use app\manager\model;
use app\manager\validate;
use app\common\component\Code;

/*
 * 订单
 */

class Order extends Base {

    //获取列表
    public function getList() {
        $model = new model\Order();
        $data = input('');
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        return $model->getList($this->mchId, $data, $pageNo, $pageSize);
    }

    //统计列表
    public function reportList() {
        $model = new model\Order();
        $data = $this->request->param();
        isset($data['order']) || $data['order'] = 'pay_time desc';
        isset($data['start_time']) || $data['start_time'] = get_now_time('Y-m-d') . ' 00:00:00';
        isset($data['end_time']) || $data['end_time'] = get_now_time('Y-m-d') . ' 23:59:59';
        isset($data['pay_type']) || $data['pay_type'] = ['CASH','WXPAY','ALIPAY','SITEPAY'];
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        $result=$model->reportList($this->mchId, $data, $pageNo, $pageSize);
        return $result;
    }
}
