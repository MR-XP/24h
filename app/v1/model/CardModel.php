<?php

namespace app\v1\model;

use think\Db;
use think\Model;

class CardModel extends \app\common\model\Card {

    /**
     * 商品列表
     * @param type $mchId
     * @param type $where
     * @param type $page
     * @return type
     */
    public function get_card_list($mchId,$shopId='') {
        $field = 'card_id,card_name,origin_price,price,image,groups';
        $where = ['mch_id' => $mchId, 'status' => 1];
        $list = $this->field($field)->where($where)->order("sort desc")->select();
        $result=[];
        if($list){
            foreach ($list as $kel=>&$value){
                $groups=implode(",", $value['groups']);
                $value['group']=[];
                if(!empty($groups)){
                    $groupSql="select `title`,`shops` from mch_shop_group where mch_id=".$mchId." and status=1 and group_id in (". $groups .")";
                    $group_data=Db::query($groupSql);
                    if($group_data){
                        foreach ($group_data as $key=>&$item){
                            $item['shop']=[];
                            if(!empty($item['shops'])){
                                $shopSql="select `shop_name`,`shop_id` from mch_shop where mch_id=".$mchId." and status=1 and shop_id in (". $item['shops'] .")";
                                $item['shop']=Db::query($shopSql);
                               if(!empty($shopId)) {
                                   if ($item['shop']) {
                                       foreach ($item['shop'] as $its => $it) {
                                           if ($shopId === $it['shop_id']) {
                                              $result[]=$value;
                                           }
                                       }
                                   }
                               }

                            }
                        }

                    }
                    $value['group']=$group_data;
                }

            }
        }
        if(empty($shopId)){
            return $list;
        }

        return $result;
    }

    /**
     * 商品详情
     * @param type $mchId
     * @param type $card_id
     * @return string
     */
    public function get_card_info($mchId, $card_id) {

        $field = 'card_id,card_name,origin_price,price,image,description,groups,max_buy';
        $where = ['mch_id' => $mchId, 'card_id' => $card_id, 'status' => 1];
        $info = $this->field($field)->where($where)->find();

        $groups=implode(",", $info['groups']);

        $info['group']=[];
        if(!empty($groups)){
            $groupSql="select `title`,`shops` from mch_shop_group where mch_id=".$mchId." and status=1 and group_id in (". $groups .")";
            $group_data=Db::query($groupSql);
            if($group_data){
                foreach ($group_data as $key=>&$item){
                    $item['shop']=[];
                    if(!empty($item['shops'])){
                        $shopSql="select `shop_name` from mch_shop where mch_id=".$mchId." and status=1 and shop_id in (". $item['shops'] .")";
                        $item['shop']=Db::query($shopSql);
                    }
                }

            }
            $info['group']=$group_data;
        }

        return $info;
    }

}
