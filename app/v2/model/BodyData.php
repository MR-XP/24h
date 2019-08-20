<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018/6/14
 * Time: 15:11
 */

namespace app\v2\model;

use app\common\component\Code;

class BodyData extends \app\common\model\DeviceRecord{

    /*
     * 数据报表
     */
    public function dataCount($mchId,$user){

        $data = [];

        //课程查询
        $courseWhere = [
            'mch_id'        =>  $mchId,
            'user_id'       =>  $user['user_id'],
            'status'        =>  self::STATUS_ENABLE,
            'sign'          =>  ['GT',self::STATUS_DISABLE],
            ''              =>  ['exp', "sign_out_time = '0000-00-00 00:00:00' or sign_out_time >= end_time"]
        ];
        $data['privateCount']   =   Appointment::where($courseWhere)->where(['plan_type' => Course::TYPE_PRIVATE])->count();
        $data['groupCount']     =   Appointment::where($courseWhere)->where(['plan_type' => Course::TYPE_GROUP])->count();
        $data['publicCount']    =   Appointment::where($courseWhere)->where(['plan_type' => Course::TYPE_PUBLIC])->count();

        //签到查询
        $signWhere = [
            'mch_id'        =>  $mchId,
            'user_id'       =>  $user['user_id']
        ];
        $sign = new Sign();
        $sign = $sign->where($signWhere)->column('sign_time');
        foreach($sign as $key => $val){
            $sign[$key] = substr($val,0,10);
        }
        $data['signDay'] = count(array_count_values($sign));

        //最近跑步查询
        $runWhere = [
            'user_id'   =>  $user['user_id'],
            'mch_id'    =>  $mchId,
            'type'      =>  self::DEVICE_RUN,
        ];
        $runField = "step,distance,energy_consumption,time_duration,avg_speed,avg_slope,heart_rate,create_time";
        $run = self::where($runWhere)
                    ->order(['create_time' => 'desc'])
                    ->field($runField)
                    ->find();
        $data['run'] = $run;
        return $data;
    }

    /*
     * 跑步排行
     */
    public function runRankings($mchId,$user,$limit){
        
        $data = [
            'self'      =>  [],
            'today'     =>  [],
            'history'   =>  []
        ];
        $where = [
            'mch_id'    =>  $mchId,
            'type'      =>  self::DEVICE_RUN,
            'distance'  =>  ['GT',0]        //里程
        ];
        $order = [
            'distance'  =>  'desc'
        ];
        $field = 'distance,time_duration,mch_id,user_id';

        //所有记录排行
        $arrData =  self::where($where)->order($order)->field($field)->select();
        $arrNo   =  self::where($where)->order($order)->column('user_id');

        //个人历史最高记录
        $selfNo=array_search($user['user_id'],$arrNo);
        $data['self']['distance']       = $arrData[$selfNo]['distance'];
        $data['self']['time_duration']  = $arrData[$selfNo]['time_duration'];
        $data['self']['user']           = $arrData[$selfNo]['user_id'];
        if($selfNo || $selfNo == 0){
            $data['self']['user']['selfNo']=++$selfNo;
        }else{
            $data['self']['user']['selfNo']='暂无名次';
        }

        //历史排行
        $history = [];
        for($i=0;$i<$limit;$i++){
            $history[] = [
                'distance'          =>  $arrData[$i]['distance'],
                'time_duration'     =>  $arrData[$i]['time_duration'],
                'mch_id'            =>  $arrData[$i]['mch_id']
            ];
            if($arrData[$i]['user_id']){
                $history[$i]['user'] = $arrData[$i]['user_id'];
                $history[$i]['user']['days'] = ceil((time() - strtotime($arrData[$i]['user_id']['create_time'])) / 3600 / 24).'天';
            }
        }
        $data['history'] = $history;

        //今日排行
        $todayModel = self::where($where)
                    ->where(['create_time' => [
                        ['EGT',get_now_time('Y-m-d').' 00:00:00'],
                        ['ELT',get_now_time('Y-m-d').' 23:59:59'],
                        'AND'
                    ]])
                    ->order($order)
                    ->field($field)
                    ->limit($limit)
                    ->select();
        $today = [];
        foreach($todayModel as $key => $val){
            $today[] = [
                'distance'          =>  $val['distance'],
                'time_duration'     =>  $val['time_duration'],
                'mch_id'            =>  $val['mch_id']
            ];
            if($val['user_id']){
                $today[$key]['user'] = $val['user_id'];
                $today[$key]['user']['days'] = ceil((time() - strtotime($val['user_id']['create_time'])) / 3600 / 24).'天';
            }
        }
        $data['today'] = $today;
        return $data;
    }

    /*
     * 跑步记录
     */
    public function runRecord($mchId,$user,$params){

        $data = [
            'km'    =>  0,
            'kil'   =>  0,
            'min'   =>  0
        ];
        $where = [
            'mch_id'    =>  $mchId,
            'type'      =>  self::DEVICE_RUN,
            'distance'  =>  ['GT',0],           //里程
            'user_id'   =>  $user['user_id']
        ];
        $order = [
            'create_time'  =>  'asc'
        ];
        $field = 'distance,time_duration,energy_consumption,create_time';

        if(!empty($params['time'])){
            if($params['time'] == 'week'){
                $day = 60 * 60 * 24;
                $number = date("w");
                $number = $number == 0?7:$number;
                $fast= date("Y-m-d",strtotime(date('Y-m-d')) - ($day * $number) + $day);
                $where['create_time'] = [
                    ['EGT',$fast.' 00:00:00'],
                    ['ELT',date('Y-m-d',strtotime($fast) + $day * 6).' 23:59:59'],
                    'AND'
                ];
            }
            if($params['time'] == 'month'){
                $where['create_time'] = [
                    ['EGT',date('Y-m-01').' 00:00:00'],
                    ['ELT',date('Y-m-d',strtotime(date('Y-m-01')."+1 month -1 day")).' 23:59:59'],
                    'AND'
                ];
            }

        }else{
            $where['create_time'] = [
                ['EGT',$params['start_time']],
                ['ELT',$params['end_time']],
                'AND'
            ];
        }

        //数据
        $arr = self::where($where)
                            ->order($order)
                            ->field($field)
                            ->select();

        $dayArr= [];
        foreach($arr as $val){
            $data['km']     +=   $val['distance'];
            $data['kil']    +=   $val['energy_consumption'];
            $data['min']    +=   $val['time_duration'];
            $data['list'][date('Y-m-d', strtotime($val['create_time']))] = [];
            $dayArr[date('Y-m-d', strtotime($val['create_time']))][] = $val;
        }

        foreach($dayArr as $key => $val){

            $distance = 0;
            $time_duration = 0;
            $energy_consumption = 0;
            foreach($dayArr[$key] as $subval){
                $distance +=$subval['distance'];
                $time_duration +=$subval['time_duration'];
                $energy_consumption +=$subval['energy_consumption'];
            }
            $data['list'][$key]=[
                'distance'              =>  $distance,
                'time_duration'         =>  $time_duration,
                'energy_consumption'    =>  $energy_consumption
            ];

        }

        return $data;
    }
}