<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace app\v1\controller;

use app\v1\model;
use think\Session;

/**
 * Description of Shop
 *
 * @author Administrator
 */
class Shop extends Base {

    public function getShopList() {
        $longitude = input('longitude'); //经度
        $latitude = input('latitude'); //纬度
        if (empty($longitude) || empty($latitude)) {
            //获取经纬度
            $longitude = Session::get('longitude');
            $latitude = Session::get('latitude');
        }
        //获取省市
        $province = input('province'); //省
        $city = input('city'); //市
        $Shop = new \app\v1\model\ShopModel();
        $list = $Shop->get_shop_list($this->merchant['mch_id'], $province, $city, $latitude, $longitude);
        return success($list);
    }

    public function getAdress($latitude, $longitude) {
        $ak = "Guerl4IjSkMCDOD8hBkwWGFvG70B96Fm";
        $url = "http://api.map.baidu.com/geocoder/v2/?location={$latitude},{$longitude}&output=json&pois=1&ak={$ak}";
        $address_data = file_get_contents($url);
        $json_data = json_decode($address_data, TRUE);
        $adress = $json_data['result']['addressComponent'];
        return $adress;
    }

    public function getShopOnline() {
        $shopId = input('post.shop_id');

        if (!$shopId) {
            return error(0, '参数错误');
        }
        $count = (new model\Shop())->getShopOnline($this->merchant['mch_id'], $shopId);
        return success($count);
    }

    public function getShopDetail() {
        $data = input('');
        if (!isset($data['shop_id'])) {
            return error(0, '参数错误');
        }
        $shopId = $data['shop_id'];

        $Shop = new \app\v1\model\ShopModel();

        $info = $Shop->get_shop_detail($this->merchant['mch_id'], $shopId);
        return $info;
    }

    //查找所开店铺的所有省市
    public function getProvinceCity() {
        //经度
//        $longitude=input('longitude');
//        //纬度
//        $latitude=input('latitude');
////        if(empty($longitude)||empty($latitude)){
////            $longitude=108.978661;
////            $latitude=34.377545;
////        }
//        if ($longitude && $latitude) {
//            $addressinfo = $this->getAdress($latitude, $longitude);
//
//            $province = $addressinfo['province'];
//            $city = $addressinfo['city'];
//
//        }
        $shop = new model\Shop();
        $address = $shop->getProvinceCity($this->merchant['mch_id']);

        return $address;
    }

    /**
     * 所有经纬度查找所在省市
     */
    public function getAddress() {
        //经度
        $longitude = input('longitude');
        //纬度
        $latitude = input('latitude');
//        将经纬度存入session中
        Session::set('longitude', $longitude);
        Session::set('latitude', $latitude);
        //判断
        if (empty($longitude) || empty($latitude)) {
            return error(0, '参数错误');
        }
        if ($longitude && $latitude) {
            $addressinfo = $this->getAdress($latitude, $longitude);
        }
        return success($addressinfo);
    }
    //根据省市获取shopid


}
