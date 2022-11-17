/*
 * @Author: 悦者生存 1002783067@qq.com
 * @Date: 2022-11-12 16:12:52
 * @LastEditors: 悦者生存 1002783067@qq.com
 * @LastEditTime: 2022-11-15 20:45:41
 * @FilePath: /imooc-ws-cli-dev/core/core/lib/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
'use strict';

module.exports = core;

const pkg = require('../../../package.json');
const log = require('@imooc-ws-cli-dev/log');

function core() {
    checkPkgVersion();
}

function checkPkgVersion() {
    log.info(pkg.version);
}