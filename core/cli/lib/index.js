/*
 * @Author: 悦者生存 1002783067@qq.com
 * @Date: 2022-11-12 16:12:52
 * @LastEditors: 悦者生存 1002783067@qq.com
 * @LastEditTime: 2022-11-22 23:03:11
 * @FilePath: /imooc-ws-cli-dev/core/core/lib/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
'use strict';


const semver = require('semver');
const fs = require('fs-extra');
const chalk = require('chalk');
const userHome = require('user-home');
const { program } = require('commander');
const path = require('path');
const log = require('@imooc-ws-cli-dev/log');
const pkg = require('../package.json');
const { LOWEST_PKG_VERSION, DEFAULT_CLI_HOME } = require('./const');

let argvs = {};

async function core() {
    try {
        await prepare();
        registerCommand();
    } catch (e) {
        log.error(e.message);
        if (program) {}
    }
}

function registerCommand() {
    program
        .name(Object.keys(pkg.bin)[0])
        .usage("<command> [options]")
        .version(pkg.version) // 添加版本信息
        .option('-d, --debug', '是否开启调试模式', false)
        .option('-tp, --targetPath <targetPath>', '是否指定本地调试文件路径', '');
    
    // program
    //     .command('init [projectName]')
    //     .option('-f, --force', '是否强制初始化项目')
    //     .action(exec);
    
    program.on('option:debug', function () {
        const options = this.opts();
        if (options.debug) {
            process.env.LOG_LEVEL = 'verbose'
        } else {
            process.env.LOG_LEVEL = 'info';
        }
        log.level = process.env.LOG_LEVEL;
        log.verbose('test');
    })
    // 监听参数
    program.parse(process.argv);
}


async function prepare() {
    // TODO: 第二遍看视频的话，要弄懂为什么要做这些事情\
    checkPkgVersion();
    checkRoot();
    checkUserHome();
    checkArgv();
    checkEnv();
    await checkGlobalUpdate();
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
    if (!userHome || !fs.pathExistsSync(userHome)) {
        throw new Error(chalk.red(`the user main directory is not exist`));
    }
}

// 检查是否有debug
function checkArgv() {
    if (argvs.debug) {
        process.env.LOG_LEVEL = 'verbose';
    } else {
        process.env.LOG_LEVEL = 'info';
    }
    log.level = process.env.LOG_LEVEL;
}

// 检查环境变量有哪些配置
function checkEnv() {
    // 默认查看当前目录下的.env文件
    const dotenv = require('dotenv');
    const dotEnvPath = path.resolve(userHome, '.env');
    let config = {};
    if (fs.pathExistsSync(dotEnvPath)) {
        dotenv.config({
            path: dotEnvPath
        })
    }
    config = createDefaultCliPath();
    log.verbose("环境变量", process.env.CLI_HOME_PATH);
}

function createDefaultCliPath() {
    const cliConfig = {
        home: userHome,
    };
    if (process.env.CLI_HOME) {
        cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME);
    } else {
        cliConfig['cliHome'] = path.join(userHome, DEFAULT_CLI_HOME);
    }
    process.env.CLI_HOME_PATH = cliConfig.cliHome;
}

async function checkGlobalUpdate() {
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  const { getNpmSemverVersion } = require('@imooc-ws-cli-dev/npm-info');
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName);
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(chalk.yellow(`请手动更新 ${npmName}，当前版本：${currentVersion}，最新版本：${lastVersion}
                更新命令： npm install -g ${npmName}`));
  }
}

module.exports = core;