/*
 * @Author: 悦者生存 1002783067@qq.com
 * @Date: 2022-11-26 22:55:21
 * @LastEditors: 悦者生存 1002783067@qq.com
 * @LastEditTime: 2022-12-22 22:09:20
 * @FilePath: /imooc-ws-cli-dev/commands/init/lib/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
'use strict';

const fs = require('fs-extra');
const inquirer = require('inquirer');
const path = require('path');
const semver = require('semver');
const userHome = require('user-home');
const Command = require('@imooc-ws-cli-dev/command');
const Package = require('@imooc-ws-cli-dev/package');
const log = require('@imooc-ws-cli-dev/log');

// 要创建的项目类型
const TYPE_PROJECT = 'project';
const TYPE_COMPONENT = 'component';

class InitCommand extends Command{
    init() {
        this.projectName = this._argv[0] || '';
        this.force = !!this._cmd.force;
        log.verbose('projectName', this.projectName);
        log.verbose('force', this.force);
    }

    async exec() {
        try {
            // 1. 准备阶段
            await this.prepare();
            // 2. 下载模板
            // 3. 安装模板
        } catch (e) {
            log.error(e.message);
        }
    }

    async prepare() {
        const localPath = process.cwd();
        // 1. 判断当前目录是否为空
        if (!this.isDirEmpty()) {
            let ifContinue = false;
           // 如果没有要求强制创建的话
            if (!this.force) {
                // 询问是否继续创建
                ifContinue = await inquirer.prompt({
                    type: 'confirm',
                    name: 'ifContinue',
                    default: false,
                    message: 'current Dir is not empty, whether to continue creating the project',
                }).ifContinue;
                if (!ifContinue) {
                    return;
                }
            }
        }
        // 2. 是否启动强制更新
        if (ifContinue || this.force) {
            // 给用户二次确认
            const { confirmDelete } = await inquirer.prompt({
                type: 'confirm',
                name: 'confirmDelete',
                default: false,
                message: 'Are you sure to empty the current Dir?'
            })
            if (confirmDelete) {
                // 清空当前目录
                fs.emptyDirSync(localPath);
            }
        }
        return this.getProjectInfo();
        // 3. 选择创建项目或组件
        // 4. 获取项目的基本信息
    }

    async getProjectInfo() {
        // 是否是有效的名字
        function isValidName(v) {
            return /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(v);
        }

        let projectInfo = {};
        let isProjectNameValid = false;
        if (isValidName(this.projectName)) {
            isProjectNameValid = true;
            projectInfo.projectName = this.projectName;
        }

        // 1. 选择创建项目或组件
        const { type } = await inquirer.prompt({
            type: 'list',
            name: 'type',
            message: 'please select the project type',
            default: TYPE_PROJECT,
            choices: [{
                name: 'project',
                value: TYPE_PROJECT,
            }, {
                name: 'component',
                value: TYPE_COMPONENT,
            }]
        });
        log.verbose('type', type);
        this.template = this.template.filter(template =>
            template.tag.includes(type));
        const title = type === TYPE_PROJECT ? 'project' : 'component';
        const projectNamePrompt = {
            type: 'input',
            name: 'projectName',
            message: `please input ${title} name`,
            default: '',
            validate: (v) => {
                const done = this.async();
                setTimeout(function () {
                    // 1.首字符必须为英文字符
                    // 2.尾字符必须为英文或数字，不能为字符
                    // 3.字符仅允许"-_"
                    if (!isValidName(v)) {
                        done(`请输入合法的${title}名称`);
                        return;
                    }
                    done(null, true);
                }, 0);
            },
            filter: function (v) {
                return v;
            },
        };
        const projectPrompt = [];
        if (!isProjectNameValid) {
            projectPrompt.push(projectNamePrompt);
        }
        projectPrompt.push({
            type: 'input',
            name: 'projectVersion',
            message: `please input ${title} version number`,
            default: '1.0.0',
            validate: function (v) {
                const done = this.async();
                setTimeout(function () {
                    if (!(!!semver.valid(v))) {
                        done('请输入合法的版本号');
                        return;
                    }
                    done(null, true);
                }, 0);
            },
            filter: function (v) {
                if (!!semver.valid(v)) {
                    return semver.valid(v);
                } else {
                    return v;
                }
            },
        }, {
            type: 'list',
            name: 'projectTemplate',
            message: `请选择${title}模板`,
            choices: this.createTemplateChoice(),
        });
        if (type === TYPE_PROJECT) {
            // 2. 获取项目的基本信息
            const project = await inquirer.prompt(projectPrompt);
            projectInfo = {
                ...projectInfo,
                type,
                ...project,
            };
        } else if (type === TYPE_COMPONENT) {
            const descriptionPrompt = {
                type: 'input',
                name: 'componentDescription',
                message: '请输入组件描述信息',
                default: '',
                validate: function(v) {
                  const done = this.async();
                  setTimeout(function() {
                    if (!v) {
                      done('请输入组件描述信息');
                      return;
                    }
                    done(null, true);
                  }, 0);
                },
            };
            projectPrompt.push(descriptionPrompt);
            // 2. 获取组件的基本信息
            const component = await inquirer.prompt(projectPrompt);
            projectInfo = {
              ...projectInfo,
              type,
              ...component,
            };
        }
         // 生成classname
      if (projectInfo.projectName) {
        projectInfo.name = projectInfo.projectName;
        projectInfo.className = require('kebab-case')(projectInfo.projectName).replace(/^-/, '');
      }
      if (projectInfo.projectVersion) {
        projectInfo.version = projectInfo.projectVersion;
      }
      if (projectInfo.componentDescription) {
        projectInfo.description = projectInfo.componentDescription;
      }
      return projectInfo;
    }

    isDirEmpty(localPath) {
        let fileList = fs.readdirSync(localPath);
        // 文件的过滤
        fileList = fileList.filter(file => (
            !file.startsWith('.') && ['node_modules'].indexOf(file)
        ));
        return !fileList.length; 
    }
}

function init(argv) {
    return new InitCommand(argv);
}

module.exports = init;
module.exports.InitCommand = InitCommand;
