<?php

namespace app\manager\controller;

use app\manager\model;

/**
 * 统计
 */
class Report extends Base {

    //会员统计
    public function memberCount() {
        $model = new model\Member();
        $data = $this->request->param();
        isset($data['time_type']) || $data['time_type'] = 'day';
        isset($data['card_status']) || $data['card_status'] = 0;
        $time = get_time_range(get_now_time('Y-m-d'), $data['time_type']);
        $data['start_time'] = $time[0];
        $data['end_time'] = $time[1];
        return success($model->totalCount($this->mchId, $data));
    }

    //签到统计
    public function signCount() {
        $model = new model\Sign();
        $data = $this->request->param();
        isset($data['time_type']) || $data['time_type'] = 'day';
        $time = get_time_range(get_now_time('Y-m-d'), $data['time_type']);
        $data['start_time'] = $time[0];
        $data['end_time'] = $time[1];
        return success($model->totalCount($this->mchId, $data));
    }

    //销售额
    public function totalSales() {
        $model = new model\Order();
        $data = $this->request->param();
        isset($data['time_type']) || $data['time_type'] = 'day';
        if ($data['time_type'] != 'all') {
            $time = get_time_range(get_now_time('Y-m-d'), $data['time_type']);
            $data['start_time'] = $time[0];
            $data['end_time'] = $time[1];
        }
        return success($model->totalSales($this->mchId, $data));
    }

    //预约数
    public function appointmentCount() {
        $model = new model\Appointment();
        $data = $this->request->param();
        isset($data['time_type']) || $data['time_type'] = 'day';
        $time = get_time_range(get_now_time('Y-m-d'), $data['time_type']);
        $data['start_time'] = $time[0];
        $data['end_time'] = $time[1];
        return success($model->totalCount($this->mchId, $data));
    }

    //激活数量
    public function activeCardCount() {
        $model = new model\SoldCard();
        $data = $this->request->param();
        isset($data['time_type']) || $data['time_type'] = 'day';
        $time = get_time_range(get_now_time('Y-m-d'), $data['time_type']);
        $data['start_time'] = $time[0];
        $data['end_time'] = $time[1];
        $data['active'] = 1;
        return success($model->totalCount($this->mchId, $data));
    }

}
