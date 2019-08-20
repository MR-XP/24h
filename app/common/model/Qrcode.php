<?php

namespace app\common\model;

use app\common\component\Code;
use app\common\component\WeChat;
use think\Db;
use think\Cache;

/**
 * 二维码
 */
class Qrcode extends Base {

    protected $table = 'mch_qrcode';
    protected $insert = ['create_time'];

    const TYPE_PERMANENT = 1;
    const TYPE_TEMPORARY = 2;

    protected $_type = [
        1 => '永久',
        2 => '临时',
    ];

    public function setCreateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

    public function setActionAttr($value) {
        return strtoupper($value);
    }

    public function getTypeTextAttr($value, $data) {
        return get_format_state($data['type'], $this->_type);
    }

    /**
     * 获取门禁二维码
     * @param type $merchant
     * @param type $shop
     * @param type $signType 'SIGN' or 'SIGNOUT'
     * @return type
     */
    public function getOpenDoorQrcode($merchant, $device, $signType) {
        $code = $this->where("mch_id={$merchant->mch_id} and action_id={$device['shop_id']} and action='$signType'")
                        ->order('create_time DESC')->find();
        //没有二维码或者过期
        if (!$code || strtotime($code['create_time']) + $device['qrcode_interval'] <= get_now_time()) {
            $wechat = WeChat::instance($merchant);
            $result = $wechat->createQrcode($merchant->mch_id, self::TYPE_TEMPORARY);
            if ($result['code'] == Code::SUCCESS) {
                $qrcode = $result['data'];
                $code = [
                    'mch_id' => $merchant->mch_id,
                    'name' => $signType,
                    'type' => self::TYPE_TEMPORARY,
                    'expire_seconds' => isset($qrcode['expire_seconds']) ? $qrcode['expire_seconds'] : 0,
                    'scene_id' => $qrcode['scene_id'],
                    'ticket' => $qrcode['ticket'],
                    'url' => $qrcode['url'],
                    'action' => $signType,
                    'action_id' => $device['shop_id'],
                    'action_attach' => $device['device_alias'],
                ];
                //return success($code);
                $re = $this->data($code)->save();
                if ($re) {
                    return success($code);
                } else {
                    return error(Code::VALIDATE_ERROR, $this->getError());
                }
            } else {
                return $result;
            }
        }
        return success($code);
    }

    /**
     * 获取设备二维码
     * @param type $merchant
     * @param type $deviceId
     * @param type $action
     * @return type
     */
    public function getDeviceQrcode($merchant, $mac, $action) {
        $wechat = WeChat::instance($merchant);
        $result = $wechat->createQrcode($merchant->mch_id, self::TYPE_TEMPORARY);
        if ($result['code'] == Code::SUCCESS) {
            $qrcode = $result['data'];
            $code = [
                'mch_id' => $merchant->mch_id,
                'name' => $action,
                'type' => self::TYPE_TEMPORARY,
                'expire_seconds' => isset($qrcode['expire_seconds']) ? $qrcode['expire_seconds'] : 0,
                'scene_id' => $qrcode['scene_id'],
                'ticket' => $qrcode['ticket'],
                'url' => $qrcode['url'],
                'action' => $action,
                'action_id' => 1,
                'action_attach' => $mac,
            ];
            $re = $this->data($code)->save();
            if ($re) {
                return success($code);
            } else {
                return error(Code::VALIDATE_ERROR, $this->getError());
            }
        } else {
            return $result;
        }
    }

    /**
     * 扫码处理
     * @param type $wechat
     * @param type $data
     */
    public function scan($merchant, $data) {
        $wechat = WeChat::instance($merchant);
        $code = $this->where(['mch_id' => $merchant->mch_id, 'ticket' => $data['Ticket']])->find();
        if (!$code) {
            return $wechat->buildReplyXml($data['ToUserName'], $data['FromUserName'], Code::$codes[Code::QRCODE_DISABLE]);
        }
        $shop = Shop::get(['mch_id' => $merchant->mch_id, 'shop_id' => $code['action_id']]);
        if (!$shop) {
            return $wechat->buildReplyXml($data['ToUserName'], $data['FromUserName'], Code::$codes[Code::QRCODE_DISABLE]);
        }
        $member = Member::get(['mch_id' => $merchant->mch_id, 'open_id' => $data['FromUserName']]);
        if (!$member) {
            return $wechat->buildReplyXml($data['ToUserName'], $data['FromUserName'], '请先注册为会员！');
        }
        if ($member['status'] != Member::STATUS_ENABLE) {
            return $wechat->buildReplyXml($data['ToUserName'], $data['FromUserName'], '账号已禁用');
        }
        switch ($code['action']) {
            case 'SIGN': //进门
                return (new Sign())->sign($merchant, $shop, $data, $member, $code);
                break;
            case 'SIGNOUT': //出门
                return (new Sign())->signOut($merchant, $shop, $data, $member, $code);
                break;
            case 'DEVICE_START'://启动设备
                return (new Device())->selfStart($merchant, $shop, $data, $member, $code);
                break;
            case 'SALE'://会籍二维码
                Cache::set('SALE-' . $member['user_id'], $code['action_id']);
                return $wechat->buildReplyXml($data['ToUserName'], $data['FromUserName'], '会籍顾问绑定成功！');
                break;
        }
        return 'error';
    }

    /**
     * 生成会籍顾问固定的二维码
     */
    public function getSaleQrcode($merchant, $userId, $action, $data) {
        $wechat = WeChat::instance($merchant);
        $code=$this
            ->where('action_id',$userId)
            ->where('mch_id',$merchant->mch_id)
            ->where('type',self::TYPE_PERMANENT)
            ->where('shop_id',$data['shop_id'])
            ->find();
        if($code&&!empty($code)){
            return success($code);
        }else{
            $result = $wechat->createQrcode($merchant->mch_id, self::TYPE_PERMANENT);
            if ($result['code'] == Code::SUCCESS) {
                $qrcode = $result['data'];
                $code = [
                    'mch_id' => $merchant->mch_id,
                    'name' => $action,
                    'shop_id'=>$data['shop_id'],
                    'type' => self::TYPE_PERMANENT,
                    'expire_seconds' => isset($qrcode['expire_seconds']) ? $qrcode['expire_seconds'] : 0,
                    'scene_id' => $qrcode['scene_id'],
                    'ticket' => $qrcode['ticket'],
                    'url' => $qrcode['url'],
                    'action' => $action,
                    'action_id' => $userId,
                    'action_attach' => $data,
                ];
                $re = $this->data($code)->save();
                if ($re) {
                    return success($code);
                } else {
                    return error(Code::VALIDATE_ERROR, $this->getError());
                }
            } else {
                return $result;
            }
        }

    }

    /** by wanqunhua
     * @param $frame
     * @param bool $filename
     * @param int $pixelPerPoint
     * @param int $outerFrame
     * @param bool $saveandprint
     */

    public static function png($frame, $filename = false, $pixelPerPoint = 4, $outerFrame = 4, $saveandprint = FALSE) {
        $image = self::image($frame, $pixelPerPoint, $outerFrame);

        if ($filename === false) {
            Header("Content-type: image/png");
            ImagePng($image);
        } else {
            if ($saveandprint === TRUE) {
                ImagePng($image, $filename);
                header("Content-type: image/png");
                ImagePng($image);
            } else {
                ImagePng($image, $filename);
            }
        }

        ImageDestroy($image);
    }

    private static function image($frame, $pixelPerPoint = 4, $outerFrame = 4) {
        $h = count($frame);
        $w = strlen($frame[0]);

        $imgW = $w + 2 * $outerFrame;
        $imgH = $h + 2 * $outerFrame;

        $base_image = ImageCreate($imgW, $imgH);

        $col[0] = ImageColorAllocate($base_image, 255, 255, 255);
        $col[1] = ImageColorAllocate($base_image, 0, 0, 0);

        imagefill($base_image, 0, 0, $col[0]);

        for ($y = 0; $y < $h; $y++) {
            for ($x = 0; $x < $w; $x++) {
                if ($frame[$y][$x] == '1') {
                    ImageSetPixel($base_image, $x + $outerFrame, $y + $outerFrame, $col[1]);
                }
            }
        }

        $target_image = ImageCreate($imgW * $pixelPerPoint, $imgH * $pixelPerPoint);
        ImageCopyResized($target_image, $base_image, 0, 0, 0, 0, $imgW * $pixelPerPoint, $imgH * $pixelPerPoint, $imgW, $imgH);
        ImageDestroy($base_image);

        return $target_image;
    }

}
