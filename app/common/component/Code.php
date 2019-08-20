<?php

namespace app\common\component;

/**
 * 错误信息的代码及message
 */
class Code {

    /**
     * 验证错误，验证错误的错误信息不在这里
     */
    const VALIDATE_ERROR = 0;

    /**
     * 成功
     */
    const SUCCESS = 200;

    /**
     * 未获取到上传的文件
     */
    const EMPTY_UPLOAD_FILE = 10001;

    /**
     * 请先登录
     */
    const EMPTY_LOGIN_USER = 10002;

    /**
     * 无权进行该操作
     */
    const DISALLOW = 10003;

    /**
     * CURL访问无任何返回
     */
    const EMPTY_CURL_BODY = 10004;

    /**
     * 数据库查询不到数据
     */
    const RECORD_NOT_FOUND = 10005;

    /**
     * 余额不足
     */
    const PRE_PAID_NOT_ENOUGH = 10006;

    /**
     * 保存数据失败
     */
    const SAVE_DATA_ERROR = 10007;

    /**
     * 未找到会员信息
     */
    const USER_NOT_FOUND = 10008;

    /**
     * 未找到排课信息
     */
    const PLAN_NOT_FOUND = 10009;

    /**
     * 未找到课程购买信息
     */
    const SOLD_COURSE_NOT_FOUND = 10010;

    /**
     * 预约人数已满
     */
    const PLAN_USER_FULL = 10011;

    /**
     * 预约时间已过期
     */
    const TIME_PASSD = 10012;

    /**
     * 未找到场馆信息
     */
    const SHOP_NOT_FOUND = 10013;

    /**
     * 未开放预约
     */
    const PLAN_CLOSED = 10014;

    /**
     * 只有公开课才可以免费体验
     */
    const PLAN_PUBLIC_ONLY = 10015;

    /**
     * 免费体验次数已用完
     */
    const EXPER_USED_UP = 10016;
    const SOLD_COURSE_EXPIRED = 10018;
    const SOLD_COURSE_USED_UP = 10017;
    const ENABLE_CARD_NOT_FOUND = 10019;
    const DUPLICATE_APPOINTMENT = 10020;
    const DUPLICATE_OTHER_APPOINTMENT = 10021;
    const APPOINTMENT_NOT_FOUND = 10022;
    const APPOINTMENT_COURSE_STARTD = 10023;
    const UNKNOWN_ORDER_TYPE = 10024;
    const UNKNOWN_ORDER_PRODUCT = 10025;
    const QRCODE_DISABLE = 10026;
    const PARAM_ERROR = 10027;          //参数错误
    const COURSE_LOCKED = 20001;        //锁定已锁定
    const DEVICE_NOT_FOUND = 10028;     //未找到该设备
    const CARD_LOW_GRADE = 10029;       //会员卡不支持该场馆使用
    const CARD_LOCK = 10030;            //被锁定的会员卡

    public static $codes = array(
        200 => 'success',
        404 => '未找到资源',
        403 => '无权访问',
        10001 => '请选择要上传的文件',
        10002 => '请先登录',
        10003 => '无权进行该操作',
        10004 => '请求远程数据，无任何返回',
        10005 => '未从数据库查询到数据',
        10006 => '金豆不足',
        10007 => '保存数据失败！',
        10008 => '未找到会员信息',
        10009 => '未找到排课信息',
        10010 => '未找到课程购买信息',
        10011 => '预约人数已满',
        10012 => '时间已过',
        10013 => '未找到场馆信息',
        10014 => '未开放预约',
        10015 => '只有公开课才可以免费体验',
        10016 => '免费体验次数已用完',
        10017 => '课程已用完',
        10018 => '课程已过期',
        10019 => '没有可以正常使用的会员卡',
        10020 => '你已经预约过了',
        10021 => '这个时间段你已有其他预约',
        10022 => '未找到预约信息',
        10023 => '课程已开始,不能取消',
        10024 => '未知订单类型',
        10025 => '订单关联的产品已失效',
        10026 => '请等待二维码刷新',
        10027 => '参数错误',
        10028 => '支付成功',
        10028 => '未找到该设备',
        10029 => '您的会员卡不支持该场馆使用',
        10030 => '您的会员卡已被主卡人锁定，无法使用',
        20001 => '课程已锁定，无法操作',
    );

    //官网地址
    public static $webUrl = [
        'qcydj.com',
        'testqcydj.com',
        'www.qcydj.com',
        'test.qcydj.com',
        'www.test.qcydj.com'
    ];

    //本地移动端调试
    public static $mobileUrl = [
         '127.0.0.1',
         '192.168.0.12'
    ];

}
