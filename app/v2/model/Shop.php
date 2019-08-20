<?php

namespace app\v2\model;

/**
 * 场馆
 */
class Shop extends \app\common\model\Shop {

    public function getShopOnline($mchId,$shopId) {
        $where=['mch_id'=>$mchId,'shop_id'=>$shopId,'status'=> Sign::STATUS_IN];
        return Sign::where($where)->group('user_id')->count();
    }
    /**
     * 获取所在地区省市
     */
    public function getProvinceCity($mch_id){
        $where=[
            'mch_id'=>$mch_id,
            'status'=>self::STATUS_ENABLE,
        ];
        $list = $this->where($where)->group('province')->field('province')->select();
        foreach ($list as &$value){
            $where['province']=$value['province'];
            $value['child']=$this->where($where)->group('city')->field('province,city')->select();
        }
    return success($list);

    }
    /**
     * 根据省市获取shopid
     */
    public function getShopId($province,$city,$county){
        $where=[];
        if(!empty($province)){
            $where['province']=['like',"%{$province}%"];
        }
        //市
        if(!empty($city)){
            $where['city']=['like',"%{$city}%"];
        }
        //区
        if(!empty($county)){
            $where['county']=['like',"%{$county}%"];
        }
        $filed="shop_id";
        $list=$this->where($where)->field($filed)->select();
        return $list;
    }
    /**
     * 根据shops获取最近的服务场馆
     */
    public function getShopAddress($shops,$latitude,$longitude){
        $where=[];
        $where['shop_id']=array('in',$shops);
        $where['status']=self::STATUS_ENABLE;
        //计算最近的店铺juli
        $field="shop_id,address,shop_name";
        $order="create_time asc ";

        if (!empty($latitude) && !empty($longitude)) {
            $juli = "ROUND(6378.138 * 2 * ASIN(SQRT(POW(SIN(($latitude * PI() / 180 - latitude * PI() / 180) / 2), 2 ) + COS($latitude * PI() / 180) * COS(latitude * PI() / 180) * POW(SIN(($longitude * PI() / 180 - longitude * PI() / 180 ) / 2), 2))) * 1000)";
            $field = "shop_id,address,shop_name,{$juli} as juli";
            $order = "juli asc";
        }
        $shop=$this->where($where)->field($field)->order($order)->find();
        if(!isset($shop['juli'])){
            $shop['juli']=0;
        }
        return $shop;
    }
}
