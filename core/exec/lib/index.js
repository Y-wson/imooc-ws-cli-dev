/*
 * @Author: 悦者生存 1002783067@qq.com
 * @Date: 2022-11-20 21:34:44
 * @LastEditors: 悦者生存 1002783067@qq.com
 * @LastEditTime: 2022-12-03 19:51:00
 * @FilePath: /imooc-ws-cli-dev/core/exec/lib/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
'use strict';
const Package = require('@imooc-ws-cli-dev/package');
const log = require('@imooc-ws-cli-dev/log');
const cp = require('child_process');
const path = require('path');

const SETTINGS = {
    init: '@imooc-ws-cli-dev/init',
    publish: '@imooc-ws-cli-dev/publish',
};

const CACHE_DIR = 'dependencies';

async function exec() {
    let targetPath = process.env.CLI_TARGET_PATH;
    let homePath = process.env.CLI_HOME_PATH;
    log.verbose('targetPath', targetPath);
    log.verbose('homePath', homePath);
    let storeDir = '';
    let pkg;

    const cmdObj = arguments[arguments.length - 1];
    const cmdName = cmdObj.name();
    const packageName = SETTINGS[cmdName];
    const packageVersion = 'latest';

    if (!targetPath) {
        targetPath = path.resolve(homePath, CACHE_DIR); // 生成缓存路径
        storeDir = path.resolve(targetPath, 'node_modules');
        log.verbose('targetPath', targetPath);
        log.verbose('storeDir', storeDir);
        pkg = new Package({
            targetPath,
            storeDir,
            packageName,
            packageVersion,
        });
        if (await pkg.exists()) {
            // 更新update
            await pkg.update();
        } else {
            // 安装package
            await pkg.install();
        } 
    } else {
        pkg = new Package({
            targetPath,
            packageName,
            packageVersion
        })
    }
    const rootFile = pkg.getRootFilePath();
    if (rootFile) {
        // 在当前进程中调用
        // require(rootFile).call(null, Array.from(arguments));
        // 在node子进程中调用
        const args = Array.from(arguments);
        const cmd = args[args.length - 1];
        const o = Object.create(null);
        Object.keys(cmd).forEach(key => {
            if (cmd.hasOwnProperty(key) && !key.startsWith('_') && key !== 'parent') {
                o[key] = cmd[key];
            }
        })
        args[args.length - 1] = o;
        const code = `require('${rootFile}').call(null, ${JSON.stringify(args)})`;
        const child = cp.spawn('node', ['-e', code], {
            cwd: process.cwd(),
            stdio: 'inherit'
        });
        child.on('error', e => {
            log.error(e.message);
            process.exit(1);
        });
        child.on('exit', e => {
            log.verbose('命令执行成功:' + e);
            process.exit(e);
        })
    }
}

module.exports = exec;

