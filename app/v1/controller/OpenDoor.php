<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace app\v1\controller;

use \app\common\component\Code;
use app\common\model\OpenRecord;

/**
 * Description of OpenDoor
 *
 * @author Administrator
 */
class OpenDoor extends Base {

    //开门

    public function open() {
        $shopId = input('shop_id');
        $alias = input('alias');
        $shop = \app\common\model\Shop::get(['mch_id' => $this->merchant['mch_id'], 'shop_id' => $shopId]);
        if (!$shop) {
            return error(Code::SHOP_NOT_FOUND);
        }
        $where = ['shop_id' => $shop['shop_id']];
        !empty($alias) && $where['device_alias'] = $alias;
        $device = \app\v1\model\ShopDevice::where($where)->order('id asc')->find();
        if (!$device) {
            return error(Code::DEVICE_NOT_FOUND);
        }
        $node = '/v1/opendoor/open';
        $group = new \app\common\model\Group();
        $result = $group->check($this->merchant->mch_id, $this->user['user_id'], $node);
        if ($result['code'] != Code::SUCCESS) {
            return $result;
        } else {
            $openRecord = new \app\common\model\OpenRecord();
            if ($openRecord->open($shop, $this->user['user_id'], 1, 3,$device) === true) {
                return success('');
            } else {
                return error(Code::VALIDATE_ERROR, '开门失败，请重试！');
            }
        }
    }


    /**
     * @desc EAD 厂家开门
     */
    public function openEadDoor()
    {
        $OpenRecord = new OpenRecord();
        //$res = $OpenRecord->getAccessToken();
        //var_dump($res);

        $response = $OpenRecord->openEadDoor();
        var_dump($response);

        exit;
    }

}
