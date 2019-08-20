<?php

namespace app\common\payment;

require_once 'alipay/AopSdk.php';

use app\common\component\Code;
use app\common\model\Order;
use think\Env;

/**
 * 支付宝支付
 */
class Alipay {

    use \traits\think\Instance;

    protected $appId;
    protected $privateKey;
    protected $publicKey;
    protected $gatewayUrl;
    protected $debug = false;
    protected $config;

    private function __construct($config) {
        $this->config = $config;
        $this->parseConfig();
        if (Env::get('payment.alipay_debug')) { //调试支付
            $this->debug(true);
        }
    }

    protected function parseConfig() {
        $this->appId = $this->config['app_id'];
        $this->privateKey = $this->config['private_key'];
        $this->publicKey = $this->config['public_key'];
        $this->gatewayUrl = 'https://openapi.alipay.com/gateway.do';
    }

    //调试
    public function debug($debug = false) {
        $this->debug = $debug;
        if ($debug === true) {
            $this->appId = '2016081600254562';
            $this->privateKey = 'MIIEowIBAAKCAQEAwtf4U0RDLPCRhJNEmVKcgliiDNCFm50pdOd7AvixxsSv3DwCyU0a0BSgHCtpK1BmoTE7vS3j9Ho8AwCsK6J3koJYQq6WpWZ1XvXVuNENK2qytMY2+wGLS+f7r7v44rWr97RExTaeHC39i+o11hO6aXhXC6G2XJDpn57yDzKbva/X6Q7cDejyrLYciMa05H4Ta4yuFY4llFSksiqVZZIwWZoFXHLd8Tbz75tURz6GpH76y2W2hi1s3+XIxQd0WrapOLTNZbyZXJVMgt2Vr7AGjPs6oaGYjatyC9AMvQRJJ8TZ8K0qKtUY0su5W4G0g/J7icyj2GwMTuqceBsxwfeyKwIDAQABAoIBAEwtkjpD6xur5sj1pxFm+igALUNjV4ly1d2OD0snHqJ/Dd7GW7SGf+Aw4DSDSHgV1DpbfGbHhWN1Uvc9kRLyT1upuIZBqkZ6m5MH/IpouYRrD/mbsa1LekGwLngTvwgsTVLoWSbd5s1Psdy9MlVDm1NXKHk0vY7NXXn589u7RqbPZZ7F366xZ2OH6/6OdCt7Gb+m4BUha2kzOdiKDe1uq8eyjqDhNevWBV8NHfVlpuVGZEGeCOW4q8OPgB6XT0i8ZB4JCwXnXdbIhRhDdKAnMYxZFhlrGLZ5JpZXz5Wij1d8BOfIPidaBLjH521VDgbbJpHK3JNeOLMnO/mNs2o8LpECgYEA5axArxpf5+iPjGIS6etmXoYkVPILU5VTcKyBnoUuF3K2OFenLiW7liCobl+Kkd9Wd/XWwDwuYcKX+MknTTrLoQ3x0tMZA35Lx1oiuFQ8m0Bx5g0qqvW0aR6uaXjKS7oZNVx0dyKJazEO9WoQuWScrZqYoqlsiuiyM9LO3yvPfPkCgYEA2S2nb5NmnLc6qOd280R44IT3z9yrbauIh/qhhDHXgu7W3oTFtD2KPbJPRmSssJJ4jcjG6ql0bt9d8O7xY3rhLqXwejLcdPdkG4QkblImqTzndhrSZ5QMw8YDNz/E4ql5H9cZk/RSZDhBgQp2yslmjhy/dzSLjIkZg+dAiyLqJUMCgYA+6ZBOZssem3W23qaPrQu9mMEbA7JWkvDoTFi1M4YMpj+D7368BVn9JbT9hu5ORv9InO7WeaW64bL/UxqQ7SoaU9eKCIkxi8b2NJqOI4T2ghCxE6o8alGg+eaMvamsVK3TECBXAf7ife27C/LI1eaVJ2PoKsCwzE0EJRrFxxpvAQKBgCiI5N9mW5iUelZcHU96UDVXnAkn3rcxdOIsXUkXJGpDucb+cQgbFFo/lZxF3hV2wRl1h+r0hc7L0fTOJC+1F6JlRmUIaS1Ln1ujZklQ+/ZKb8kTaIH8mAVSR/df55eGmhzfQN7kkxwxg8hZ86IVxRZxNytAm2s3i5Oa7ekKMzmRAoGBAItVz2eLM2n4CbnK263g0GDnE4fQ5z5MiA//9w2c66v2TTfQogw9S3L7Gp1c+jnV93DC4DmyIkpIaFOrQ09ab7arMTRCAl9H4JCdNg+QHVD+tdY8fBBe/+Ep/P1WDv5lZTii3PBBf79GD5aty2CyELn9Wu2EI+XroqPJ8DsHuQCd';
            $this->publicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwOJQOMFRiSTWPvm5dN9e3VrT9EsG6hWB547o1/q/w4ENOK7/mf0js1GiykVnrozy8fntxMvpUbaUb35OE/aJnmOfauQ4jy4dGCuzbbRQGLBjJdptDb3C8a1+W0/qlY79vj4Cq3IjTBdi0sUJOt8LmDXIun3ui32MUKP9b1Cx1HgwBrxiGQiYpBu2Hcv/8NI0hOClfhy7GvistlKrCFttnk233w7ZXYUhaT934RxE6h/V7ykfE/tCsGvMC0JElOo+Y6mRCEkNTW3ec7PnbOgCIc0wf9U+7p2U10evHTHSwxu6PPZcTXakr4URmmFyu5TyA8apPmMEERHKeHI7RU1MswIDAQAB';
            $this->gatewayUrl = 'https://openapi.alipaydev.com/gateway.do';
        } else {
            $this->parseConfig();
        }
    }

    /**
     * 移动支付
     * @param type $orderId
     * @param type $returnUrl 返回url
     * @param type $notifyUrl 通知url
     * @return type
     */
    public function tradeWapPay($orderId, $returnUrl, $notifyUrl, $method = 'GET') {
        $order = Order::get($orderId);
        if (!$order || $order['pay_status'] != Order::PAY_STATUS_WAIT) {
            return error(Code::RECORD_NOT_FOUND);
        }
        try {
            $aop = new \AopClient ();
            $aop->gatewayUrl = $this->gatewayUrl;
            $aop->appId = $this->appId;
            $aop->rsaPrivateKey = $this->privateKey;
            $aop->alipayrsaPublicKey = $this->publicKey;
            $aop->apiVersion = '1.0';
            $aop->postCharset = 'utf-8';
            $aop->format = 'json';
            $aop->signType = 'RSA2';
            $request = new \AlipayTradeWapPayRequest ();
            $request->setReturnUrl($returnUrl);
            $request->setNotifyUrl($notifyUrl);
            $data = [
                'body' => $order['product_detail'],
                'subject' => $order['product_info'],
                'out_trade_no' => $order['trade_no'],
                'timeout_express' => '90m',
                'total_amount' => $order['price'],
                'product_code' => 'QUICK_WAP_WAY',
                'passback_params' => $order['order_id']
            ];
            $request->setBizContent(json_encode($data));
            $result = $aop->pageExecute($request, $method);
            return success($result);
        } catch (\Exception $e) {
            return error(Code::VALIDATE_ERROR, $e->getMessage());
        }
    }

    /**
     * 验证回传签名
     * @param type $params 接收到的参数
     * @return boolean
     */
    public function checkSign($params) {
        $aop = new \AopClient ();
        $aop->gatewayUrl = $this->gatewayUrl;
        $aop->appId = $this->appId;
        $aop->rsaPrivateKey = $this->privateKey;
        $aop->alipayrsaPublicKey = $this->publicKey;
        $aop->apiVersion = '1.0';
        $aop->postCharset = 'utf-8';
        $aop->format = 'json';
        $aop->signType = $params['sign_type'];
        return $aop->rsaCheckV1($params, '', $params['sign_type']);
    }

}
