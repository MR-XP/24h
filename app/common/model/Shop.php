<?php

namespace app\common\model;

/**
 * 场馆
 */
class Shop extends Base {

    protected $table = 'mch_shop';
    protected $insert = ['create_time', 'update_time' => '0000-00-00 00:00:00'];
    protected $update = ['update_time'];
    protected $type = [
        'images'    => 'array',
        'shop_sc'   => 'array'
    ];
    protected $_status = [
        0 => '禁用',
        1 => '启用'
    ];

    public function setCreateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

    public function setUpdateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

    public function getStatusTextAttr($value, $data) {
        return get_format_state($data['status'], $this->_status);
    }
}
