<?php

namespace app\v2\model;

class ShopModel extends \think\Model {

    protected $table = 'mch_shop';

    /**
     * 根据经纬度获取 商店列表
     */
    public function get_shop_list($mchId, $province, $city, $latitude, $longitude) {

        $where = ['mch_id' => $mchId];
        !empty($city) && $where['city'] = $city;
        !empty($province) && $where['province'] = $province;
        $field = "shop_id,cover,shop_name,province,city,county,address,latitude,longitude";
        $order = "create_time asc ";
        //根据省市查找店铺

        if (!empty($latitude) && !empty($longitude)) {
            $juli = "ROUND(6378.138 * 2 * ASIN(SQRT(POW(SIN(($latitude * PI() / 180 - latitude * PI() / 180) / 2), 2 ) + COS($latitude * PI() / 180) * COS(latitude * PI() / 180) * POW(SIN(($longitude * PI() / 180 - longitude * PI() / 180 ) / 2), 2))) * 1000)";
            $field = "shop_id,cover,shop_name,latitude,longitude,province,city,county,address,{$juli} as juli";
            $order = "juli asc";
//            $where = ['mch_id' => $mchId, 'latitude' => ['between', [$minLat, $maxLat]], 'longitude' => ['latitude' => ['between' => [$minLng, $maxLng]]]];
        }
        $list = $this->field($field)->where($where)->order($order)->select();
        if($list && empty($latitude)&& empty($longitude)){
            foreach ($list as $key=>&$value){
                    $value['juli']=0;
//                if(!empty($latitude) && !empty($longitude)){
//                    $value['juli']=self::sphere_distance($myLat,$myLng,$value['latitude'],$value['longitude']);
//                }
            }
        }
        return $list;
    }

    public function get_shop_detail($mchId, $shopId) {
        $where = ['mch_id' => $mchId, 'shop_id' => $shopId, 'status' => 1];
        $shopinfo = $this->where($where)->find();
        if (!$shopinfo) {
            return error(0, '店铺不存在');
        }
        $shopinfo['images'] = json_decode($shopinfo['images'], true);
        //店铺教练
        $shopinfo['coach'] = (new Coach())->getCoachList($mchId,['shop_id'=>$shopId]);
        //店铺课程
        $shopinfo['plan'] = (new CoachPlanModel())->get_paln_list($mchId, $shopId);
        return success($shopinfo);
    }


    /**获取所开店铺
     * @param $mch_id
     * @return array
     */
    public function getShops($mch_id){
        $where=[
            'status'=>1,
            'mch_id'=>$mch_id
        ];
        $shop=$this->where($where)->select();
        if(!$shop){
            return error(0,"不好意思哦，店铺消失了~");
        }
        return success($shop);
    }
    //根据两点的经纬度计算距离

    /**
     * @param $lat1
     * @param $lon1
     * @param $lat2
     * @param $lon2
     * @param float $radius
     * @return float
     */
    public function sphere_distance($lat1, $lon1, $lat2, $lon2, $radius=6378.135) {
        $rad = doubleval(M_PI/180.0);

        $lat1 = doubleval($lat1) * $rad;
        $lon1 = doubleval($lon1) * $rad;
        $lat2 = doubleval($lat2) * $rad;
        $lon2 = doubleval($lon2) * $rad;

        $theta = $lon2 - $lon1;
        $dist = acos(sin($lat1) * sin($lat2) +
            cos($lat1) * cos($lat2) * cos($theta));
        if($dist < 0) {
            $dist += M_PI;
        }
        // 单位为 千米
        $dist = $dist * $radius;
        $dist=sprintf($dist);
        return $dist;
    }
    /**
     * 计算两点地理坐标之间的距离
     * @param  Decimal $longitude1 起点经度
     * @param  Decimal $latitude1  起点纬度
     * @param  Decimal $longitude2 终点经度
     * @param  Decimal $latitude2  终点纬度
     * @param  Int     $unit       单位 1:米 2:公里
     * @param  Int     $decimal    精度 保留小数位数
     * @return Decimal
     */
    static function getDistance($longitude1, $latitude1, $longitude2, $latitude2, $unit=2, $decimal=2){

        $EARTH_RADIUS = 6370.996; // 地球半径系数
        $PI = 3.1415926;

        $radLat1 = $latitude1 * $PI / 180.0;
        $radLat2 = $latitude2 * $PI / 180.0;

        $radLng1 = $longitude1 * $PI / 180.0;
        $radLng2 = $longitude2 * $PI /180.0;

        $a = $radLat1 - $radLat2;
        $b = $radLng1 - $radLng2;

        $distance = 2 * asin(sqrt(pow(sin($a/2),2) + cos($radLat1) * cos($radLat2) * pow(sin($b/2),2)));
        $distance = $distance * $EARTH_RADIUS * 1000;

        if($unit==2){
            $distance = $distance / 1000;
        }
        return round($distance, $decimal);
    }
}
