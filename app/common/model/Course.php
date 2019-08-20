<?php

namespace app\common\model;

/**
 * 课程
 */
class Course extends Base {

    protected $table = 'mch_course';
    protected $insert = ['create_time', 'update_time' => '0000-00-00 00:00:00'];
    protected $update = ['update_time'];
    protected $type = [
        'images' => 'array',
        'groups' => 'array'
    ];
    
    /**
     * 公开课
     */
    const TYPE_PUBLIC = 1;

    /**
     * 小团课
     */
    const TYPE_GROUP = 2;

    /**
     * 私教课
     */
    const TYPE_PRIVATE = 3;
    
    /**
     * 课程正常
     */
    const STATUS_NORMAL = 1;
    
    /**
     * 课程锁定
     */
    const STATUS_LOCKING = 0;

    protected $_type = [
        1 => '公开课',
        2 => '小团课',
        3 => '私教课',
    ];
    protected $_level = [
        1 => '一般',
        2 => '进阶'
    ];

    public function setCreateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

    public function setUpdateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

    public function getTypeTextAttr($value, $data) {
        return get_format_state($data['type'], $this->_type);
    }

    public function getLevelTextAttr($value, $data) {
        return get_format_state($data['level'], $this->_level);
    }

}
