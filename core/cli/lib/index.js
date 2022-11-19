/*
 * @Author: 悦者生存 1002783067@qq.com
 * @Date: 2022-11-12 16:12:52
 * @LastEditors: 悦者生存 1002783067@qq.com
 * @LastEditTime: 2022-11-19 13:51:26
 * @FilePath: /imooc-ws-cli-dev/core/core/lib/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
'use strict';

const semver = require('semver');
const fs = require('fs-extra');
const chalk = require('chalk');
const log = require('@imooc-ws-cli-dev/log');
const pkg = require('../../../package.json');
const { LOWEST_PKG_VERSION } = require('./const');


function core() {
    try {
        checkPkgVersion();
        checkRoot();
        checkUserHome();
    } catch (error) {
        log.warn(error);
    }
   
}

// 检测package.json版本是否大于最低版本
function checkPkgVersion() {
    const currentPkgVersion = pkg.version;
    if (!semver.gte(currentPkgVersion, LOWEST_PKG_VERSION)) {
        throw new Error(
            `imooc-ws-cli-dev suggest that your current version should greater than v${LOWEST_PKG_VERSION}, Please upgrade you version`
        )
    } else {
        log.info('cli', currentPkgVersion);
    }
}

// 避免脚手架开发者使用root权限进行文件操作，导致其他协作开发者无法对文件进行修改
function checkRoot() {
    const rootCheck = require("root-check");
    rootCheck();
}

// 检查用户主目录
function checkUserHome() {
    const userHome = require('user-home');
    if (!userHome || fs.pathExistsSync(userHome)) {
        throw new Error(chalk.red(`the user main directory is not exist`));
    }
}

module.exports = core;