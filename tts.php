<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>语音合成TTS服务</title>
    <style>
        body {
            width: 100%;
            height: 100%;
        }

        .smart-green {
            margin-top: 100px;
            margin-left: auto;
            width: 700px;
            height: 750px;
            margin-right: auto;
            max-width: 900px;
            background: #F8F8F8;
            padding: 30px 30px 20px 30px;
            font: 12px Arial, Helvetica, sans-serif;
            color: #666;
            border-radius: 5px;
            -webkit-border-radius: 5px;
            -moz-border-radius: 5px;
        }

        .smart-green h1 {
            font: 24px "Trebuchet MS", Arial, Helvetica, sans-serif;
            padding: 20px 0px 20px 40px;
            display: block;
            margin: -30px -30px 10px -30px;
            color: #FFF;
            background: #9DC45F;
            text-shadow: 1px 1px 1px #949494;
            border-radius: 5px 5px 0px 0px;
            -webkit-border-radius: 5px 5px 0px 0px;
            -moz-border-radius: 5px 5px 0px 0px;
            border-bottom: 1px solid #89AF4C;
        }

        .smart-green h1 > span {
            display: block;
            font-size: 24px;
            color: #FFF;
        }

        .smart-green label {
            display: block;
            font-size: 18px;
            margin: 10px 0px 5px;
        }

        .smart-green label > span {
            /*float: left;*/
            margin-top: 10px;
            color: #5E5E5E;
        }

        .smart-green input[type="text"], .smart-green input[type="email"],
        .smart-green textarea, .smart-green select {
            color: #555;
            height: 50px;
            line-height: 15px;
            width: 100%;
            padding: 0px 0px 0px 10px;
            margin-top: 2px;
            border: 1px solid #E5E5E5;
            background: #FBFBFB;
            outline: 0;
            -webkit-box-shadow: inset 1px 1px 2px rgba(238, 238, 238, 0.2);
            box-shadow: inset 1px 1px 2px rgba(238, 238, 238, 0.2);
            font: normal 14px/14px Arial, Helvetica, sans-serif;
        }

        .smart-green textarea {
            height: 160px;
            padding-top: 10px;
        }

        .smart-green .button {
            background-color: #9DC45F;
            border-radius: 5px;
            -webkit-border-radius: 5px;
            -moz-border-border-radius: 5px;
            border: none;
            padding: 10px 25px 10px 25px;
            color: #FFF;
            text-shadow: 1px 1px 1px #949494;
        }

        .smart-green .button:hover {
            background-color: #80A24A;
        }

        .error-msg {
            color: red;
            margin-top: 10px;
        }

        .success-msg {
            color: #80A24A;
            margin-top: 10px;
            margin-bottom: 10px;
        }

        /* 这里不考虑浏览器的兼容性 */
        .smart-green input[type="range"] {
            width: 85%;
            height: 8px;
            border-radius: 4px;
        }

    </style>
</head>
<body>

<?php

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
// text 的内容为"欢迎使用百度语音合成"的urlencode,utf-8 编码
// 可以百度搜索"urlencode"
//    $text = "为天地立心，为生民立命，为往圣继绝学，为万世开太平 。 ";
    $text = $_POST["text"];

//    $text2 = iconv("UTF-8", "GBK", $text);
//    echo "text length :" . mb_strlen($text2, "GBK") . "\n";

// 发音人选择, 基础音库：0为度小美，1为度小宇，3为度逍遥，4为度丫丫，
// 精品音库：5为度小娇，103为度米朵，106为度博文，110为度小童，111为度小萌，默认为度小美
    $per = isset($_POST['per']) ? $_POST['per'] : 111;
//语速，取值0-15，默认为5中语速
    $spd = isset($_POST['spd']) ? $_POST['spd'] : 5;
//音调，取值0-15，默认为5中语调
    $pit = isset($_POST['pit']) ? $_POST['pit'] : 5;
//音量，取值0-9，默认为5中音量
    $vol = isset($_POST['vol']) ? $_POST['vol'] : 5;

// 下载的文件格式, 3：mp3(default) 4： pcm-16k 5： pcm-8k 6. wav
    $aue = 3;
    $formats = array(3 => 'mp3', 4 => 'pcm', 5 => 'pcm', 6 => 'wav');
    $format = $formats[$aue];

    /** 拼接参数开始 **/
    $params = array(
        'tex' => urlencode($text), // 为避免+等特殊字符没有编码，此处需要2次urlencode。
        'type' => 'tns',
        'per' => $per,
        'spd' => $spd,
        'pit' => $pit,
        'vol' => $vol,
        'aue' => $aue,
    );
    $paramsStr = http_build_query($params);

    //百度举例应用访问地址
    $url = 'https://cloud.baidu.com/aidemo';

    /** 拼接参数结束 **/

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $paramsStr);
    $data = curl_exec($ch);

    if (curl_errno($ch)) {
        echo curl_error($ch);
        exit(2);
    }
    curl_close($ch);

    //判断返回正确
    $data = json_decode($data, true);
    if ($data['errno'] != 0) {
        $g_has_error = true;
        echo '获取数据失败:' . $data['msg'];
        exit(3);
    }

    //转成文件
    $mp3 = $data['data'];
    if (strstr($mp3, ",")) {
        $mp3 = explode(',', $mp3);
        $mp3 = $mp3[1];
    }

    //文件名
    $fileName = 'tts-' . date('Y-m-d-H-s-i') . '.' . $format;
    if (!empty($_POST["fileName"])) {
        $fileName = $_POST["fileName"] . '.' . $format;
    }
    $file = $fileName;

    file_put_contents($file, base64_decode($mp3)); //本地保存

    // 输出文件
    header('Content-Type: application/octet-stream');
    header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');
    header('Cache-Control: no-store, no-cache, must-revalidate');
    header('Cache-Control: pre-check=0, post-check=0, max-age=0');
    header('Content-Transfer-Encoding: binary');
    header('Content-Encoding: none');
    header('Content-type: application/force-download');
    header('Content-Disposition: attachment; filename=' . $file);
    readfile($file);
    unlink($file); //删除本地文件
}

?>

<form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" class="smart-green">
    <h1> 语音合成TTS服务 </h1>

    <label>
        <span>请输入需要合成的文案:</span>
        <textarea id="description" name="text"></textarea>
        <div class="error-msg"></div> &nbsp; &nbsp;
    </label>
    <label>
        <span>发音人 :</span>
        <select id="per" name="per">
            <option value="1">度小宇</option>
            <option value="0">度小美(默认)</option>
            <option value="3">度逍遥（基础）</option>
            <option value="4">度丫丫</option>
            <option value="5003">度逍遥（精品）</option>
            <option value="5118" selected>度小鹿</option>
            <option value="106">度博文</option>
            <option value="110">度小童</option>
            <option value="111">度小萌</option>
            <option value="103">度米朵</option>
            <option value="5">度小娇</option>
        </select>
    </label>
    <label>
        <span>语速:</span>
        <input id="spe" type="range" name="spe" value="5" min="0" max="15" step="1" onchange="changeV()">
        <span id="spe_txt">5</span>
        <br/><br/>
        <span>音调:</span>
        <input id="pit" type="range" name="pit" value="5" min="0" max="15" step="1" onchange="changeV()">
        <span id="pit_txt">5</span>
        <br/><br/>
        <span>音量:</span>
        <input id="vol" type="range" name="vol" value="5" min="0" max="15" step="1" onchange="changeV()">
        <span id="vol_txt">5</span>
    </label>

    <br/>
    <br/>
    <label>
        <span>输出文件名 :</span>
        <input id="fileName" type="text" value="" name="fileName"/>
        <div class="error-msg"></div>
    </label>
    <div class="success-msg"></div>
    <label style="align-content: center">
        <span>&nbsp;</span>
        <input type="submit" class="button" value="下载语音文件"/>
    </label>
    <input type="hidden" name="token" value="zhangbf"/>
</form>

<script>

    function changeV() {

        var spe = document.getElementById('spe');
        document.getElementById("spe_txt").innerText = spe.value;

        var pit = document.getElementById('pit');
        document.getElementById("pit_txt").innerText = pit.value;

        var vol = document.getElementById('vol');
        document.getElementById("vol_txt").innerText = vol.value;

    };
</script>
</body>
</html>

