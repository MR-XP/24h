<?php

namespace app\common\model;

/**
 * 审批记录
 */
class Approval extends Base {

    protected $table = 'log_approval';
    protected $insert = ['create_time'];

    public function setCreateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

    const STATUS_CANCEL = -1;
    const STATUS_WAITING = 0;
    const STATUS_ACCEPT = 1;
    const STATUS_REFUSE = 2;

    protected $_status = [
        -1 => '取消申请',
        0 => '申请中',
        1 => '通过',
        2 => '拒绝',
    ];

    public function getStatusTextAttr($value, $data) {
        return get_format_state($data['status'], $this->_status);
    }

}
