<?php

namespace app\common\model;

/**
 * 教练表
 */
class CoachApplication extends Base {

    protected $table = 'mch_coach_application';
    protected $insert = ['status' => 0, 'create_time'];
    protected $type = [
        'certs' => 'array'
    ];

    const STATUS_WAITING = 0;
    const STATUS_ACCEPT = 1;
    const STATUS_REFUSE = 2;

    protected $_type = [
        1 => '全职',
        2 => '兼职',
    ];
    protected $_status = [
        0 => '申请中',
        1 => '通过',
        2 => '拒绝'
    ];
    protected $_sex = [
        0 => '未知',
        1 => '男',
        2 => '女'
    ];

    public function setCreateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

    public function getStatusTextAttr($value) {
        return get_format_state($value, $this->_status);
    }

    public function getTypeText($value) {
        return get_format_state($value, $this->_type);
    }

    public function getSexText($value) {
        return get_format_state($value, $this->_sex);
    }

}
