/*
 * @Author: 悦者生存 1002783067@qq.com
 * @Date: 2022-11-30 23:09:51
 * @LastEditors: 悦者生存 1002783067@qq.com
 * @LastEditTime: 2022-12-01 20:29:17
 * @FilePath: /imooc-ws-cli-dev/models/Command/lib/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
'use strict';

const semver = require('semver');
const chalk = require('chalk');
const log = require('@imooc-ws-cli-dev/log');
// 检测node版本
const LOWEST_NODE_VERSION = '12.0.0';

class Command {
    constructor(argv) {
      if (!argv) {
        throw new Error('参数不能为空！');
      }
      if (!Array.isArray(argv)) {
        throw new Error('参数必须为数组！');
      }
      if (argv.length < 1) {
        throw new Error('参数列表为空！');
      }
      this._argv = argv;
      let runner = new Promise((resolve, reject) => {
        let chain = Promise.resolve();
        chain = chain.then(() => this.checkNodeVersion());
        chain = chain.then(() => this.initArgs());
        chain = chain.then(() => this.init());
        chain = chain.then(() => this.exec());
        chain.catch(err => {
          log.error(err.message);
        });
      });
    }
  
    initArgs() {
      this._cmd = this._argv[this._argv.length - 1];
      this._argv = this._argv.slice(0, this._argv.length - 1);
    }
  
    checkNodeVersion() {
      const currentVersion = process.version;
      const lowestVersion = LOWEST_NODE_VERSION;
      if (!semver.gte(currentVersion, lowestVersion)) {
        throw new Error(chalk.red(`imooc-cli 需要安装 v${lowestVersion} 以上版本的 Node.js`));
      }
    }
  
    init() {
      throw new Error('init必须实现！');
    }
  
    exec() {
      throw new Error('exec必须实现！');
    }
  }

module.exports = Command;
