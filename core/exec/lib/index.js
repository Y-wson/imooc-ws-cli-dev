/*
 * @Author: 悦者生存 1002783067@qq.com
 * @Date: 2022-11-20 21:34:44
 * @LastEditors: 悦者生存 1002783067@qq.com
 * @LastEditTime: 2022-11-27 16:38:53
 * @FilePath: /imooc-ws-cli-dev/core/exec/lib/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
'use strict';
const Package = require('@imooc-ws-cli-dev/package');
const log = require('@imooc-ws-cli-dev/log');

const SETTINGS = {
    init: '@imooc-cli/init',
    publish: '@imooc-cli/publish',
};

function exec() {
    let targetPath = process.env.CLI_TARGET_PATH;
    let homePath = process.env.CLI_HOME_PATH;
    log.verbose('targetPath', targetPath);
    log.verbose('homePath', homePath);
    let pkg;

    const cmdObj = arguments[arguments.length - 1];
    const cmdName = cmdObj.name();
    const packageName = SETTINGS[cmdName];
    const packageVersion = 'latest';

    pkg = new Package({
        targetPath,
        packageName,
        packageVersion
    })
}

module.exports = exec;

