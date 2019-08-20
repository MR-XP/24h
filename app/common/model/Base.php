<?php

namespace app\common\model;

use think\Model;
use app\common\component\Code;

/**
 * 基础模型，项目所有模型继承此类
 */
abstract class Base extends Model {

    //开启时间自动写入
    protected $autoWriteTimestamp = false;

    //通用常量设置
    const STATUS_DELETED = -1; //status 为-1表示删除
    const STATUS_DISABLE = 0; //status 为0表示未启用
    const STATUS_ENABLE = 1; //status 为1表示正常

}
