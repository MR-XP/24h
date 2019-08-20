<?php

namespace app\manager\controller;

use app\manager\model;
use app\common\component\Code;

/**
 * 统计
 */
class Finance extends Base {

    /**
     * 私教耗课量
     * @return array
     */
    public function totalSales() {
        $model = new model\ClassPlan();
        $data = $this->request->param();
        isset($data['time_type']) || $data['time_type'] = 'year';
        isset($data['shop_id']) ? $data['shop_id'] :'';
        if ($data['time_type'] != 'all') {
            $time = get_time_range(get_now_time('Y-m-d'), $data['time_type']);
            $data['start_time'] = $time[0];
            $data['end_time'] = $time[1];
        }
        return success($model->statisticsSales($this->mchId, $data));
    }
    /**
     * 私教耗课量
     */
    public function consumeList(){
        $model=new model\Coach();
        $data=$this->request->param();
        isset($data['time_type']) || $data['time_type'] = 'year';
        isset($data['shop_id']) ? $data['shop_id'] :'';
        if ($data['time_type'] != 'all') {
            $time = get_time_range(get_now_time('Y-m-d'), $data['time_type']);
            $data['start_time'] = $time[0];
            $data['end_time'] = $time[1];
            $lastTime=get_last_time_range(get_now_time('Y-m-d'), $data['time_type']);
            $data['last_start_time']=$lastTime[0];
            $data['last_end_time']=$lastTime[1];
        }
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        return $model->consumeList($this->mchId, $data, $pageNo, $pageSize);
    }
    /**
     * 场馆销量统计
     */
    public function shopSalesVolume(){
        $model=new model\Shop();
        $data=$this->request->param();
        isset($data['time_type']) || $data['time_type'] = 'year';
        isset($data['shop_id']) ? $data['shop_id'] :'';
        if ($data['time_type'] != 'all') {
            $time = get_time_range(get_now_time('Y-m-d'), $data['time_type']);
            $data['start_time'] = $time[0];
            $data['end_time'] = $time[1];
            $lastTime=get_last_time_range(get_now_time('Y-m-d'), $data['time_type']);
            $data['last_start_time']=$lastTime[0];
            $data['last_end_time']=$lastTime[1];
        }
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        return $model->shopSalesVolume($this->mchId, $data, $pageNo, $pageSize);
    }
    /**
     * @return int
     * 总销量
     */
    public function statiStics(){
        $model=new model\Order();
        $data=$this->request->param();
        isset($data['type'])||$data['type']='';
        isset($data['shop_id']) ? $data['shop_id'] :'';
        return $model->statiStics($this->mchId, $data);
    }
    /**
     * 耗课详情
     */
    public function classDetails(){
        $model=new model\ClassPlan();
        $data=$this->request->param();
        isset($data['shop_id']) ? $data['shop_id'] :'';
        isset($data['start_time'])||$data['start_time']=0;
        isset($data['end_time'])||$data['end_time']=get_now_time();
        return $model->classDetails($this->mchId, $data);
    }
}
