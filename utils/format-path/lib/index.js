/*
 * @Author: 悦者生存 1002783067@qq.com
 * @Date: 2022-11-27 17:23:20
 * @LastEditors: 悦者生存 1002783067@qq.com
 * @LastEditTime: 2022-11-27 17:42:34
 * @FilePath: /imooc-ws-cli-dev/utils/format-path/lib/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
'use strict';
const path = require('path');

function formatPath(p) {
    if (p && typeof p === 'string') {
        // TODO: 这个以后要进行总结的
        // path.seq是反斜杠的意思
        const sep = path.seq;
        if (sep === '/') {
            return p;
        } else {
            return p.replace(/\\/g, '/')
        }
    }
    return p;
}

module.exports = formatPath;
