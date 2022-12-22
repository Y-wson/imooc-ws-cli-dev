/*
 * @Author: 悦者生存 1002783067@qq.com
 * @Date: 2022-11-27 11:40:47
 * @LastEditors: 悦者生存 1002783067@qq.com
 * @LastEditTime: 2022-12-03 19:28:23
 * @FilePath: /imooc-ws-cli-dev/models/package/lib/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
'use strict';

const pkgDir = require('pkg-dir').sync;
const { isObject } = require('@imooc-ws-cli-dev/utils');
const formatPath = require('@imooc-ws-cli-dev/format-path');
const { getNpmLatestVersion, getDefaultRegistry } = require('@imooc-ws-cli-dev/npm-info');
const fs = require('fs-extra');
const npminstall = require('npminstall');
const path = require('path');

class Package {
    constructor(options) {
        if (!options) {
            throw new Error('Package类的options参数不能为空！');
        }
        if (!isObject(options)) {
            throw new Error('Package类的options参数必须为对象！');
        }
        // package的目标路径
        this.targetPath = options.targetPath;
        // 缓存package的路径
        this.storeDir = options.storeDir;
        // package的name
        this.packageName = options.packageName;
        // package的version
        this.packageVersion = options.packageVersion;
        // package的缓存目录的前缀
        this.cacheFilePathPrefix = this.packageName.replace('/', '_');
    }

    get cacheFilePath(){
        return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`)
    }

    async prepare() {
        if (this.storeDir && !fs.pathExistsSync(this.storeDir)) {
            // 注意这里使用的mkdirp而不是mkdir
            fs.mkdirpSync(this.storeDir);
        }
        if (this.packageVersion === 'latest') {
            this.packageVersion = await getNpmLatestVersion(this.packageName);
        }
    }

    // 安装package
    async install() {
        return npminstall({
            root: this.targetPath,
            storeDir: this.storeDir,
            registry: getDefaultRegistry(),
            pkgs: [{
              name: this.packageName,
              version: this.packageVersion,
            }],
        });
    }

    // 判断当前Package是否存在
    async exists() {
        if (this.storeDir) {
            await this.prepare();
            return fs.pathExistsSync(this.cacheFilePath);
        } else {
            return fs.pathExistsSync(this.targetPath);
        }
    }

    // 更新package
    async update() {
        await this.prepare();
        // 1. 获取最新的npm模块版本号
        const latestPackageVersion = await getNpmLatestVersion(this.packageName);
        // 2. 查询最新版本号对应的路径是否存在
        const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion);
        // 3. 如果不存在，则直接安装最新版本
        if (!fs.pathExistsSync(latestFilePath)) {
        await npminstall({
            root: this.targetPath,
            storeDir: this.storeDir,
            registry: getDefaultRegistry(),
            pkgs: [{
                name: this.packageName,
                version: latestPackageVersion,
            }],
        });
        this.packageVersion = latestPackageVersion;
        } else {
        this.packageVersion = latestPackageVersion;
        }

     }

    // 获取入口文件路径
    getRootFilePath() {
        function _getRootFile(targetPath) {
            // 1. 获取package.json所在目录
            const dir = pkgDir(targetPath);
            if (dir) {
                // 2. 读取package.json
                const pkgFile = require(path.resolve(dir, 'package.json'));
                // 3. 寻找main/lib
                if (pkgFile && pkgFile.main) {
                    // 4. 路径的兼容
                    const mainFile = formatPath(path.resolve(dir, pkgFile.main))
                    console.log('---------------', mainFile);
                    return mainFile;
                }
            }
        }
        return _getRootFile(this.targetPath);
    }
}

module.exports = Package;
