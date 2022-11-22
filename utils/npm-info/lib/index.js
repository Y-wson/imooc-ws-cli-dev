/*
 * @Author: 悦者生存 1002783067@qq.com
 * @Date: 2022-11-19 17:06:36
 * @LastEditors: 悦者生存 1002783067@qq.com
 * @LastEditTime: 2022-11-22 21:53:10
 * @FilePath: /imooc-ws-cli-dev/utils/npm-info/lib/index.js
 * @Description: get npm info
 */
'use strict';
const axios = require('axios');
const urlJoin = require('url-join');
const semver = require('semver');


function getNpmInfo(npmName, registry) {
    if (!npmName) {
        return null;
    }
    const registryUrl = registry || getDefaultRegistry();
    const npmInfoUrl = urlJoin(registryUrl, npmName);
    return axios.get(npmInfoUrl).then(response => {
        if (response.status === 200) {
            return response.data;
        }
        return null;
    }).catch(err => {
        return Promise.reject(err);
    })
}

function getDefaultRegistry(isOriginal = false) {
    return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org';
}

/**
 * @description: get remote npm versions
 * @param {string} npmName
 * @param {string} registry
 * @return {array} because the remote npm have lots of version
 */
async function getNpmVersions(npmName, registry) {
    const data = await getNpmInfo(npmName, registry);
    if (data) {
        return Object.keys(data.versions);
    } else {
        return [];
    }
}

// get versions of greater than base version
function getSemverVersions(baseVersion, versions) {
    return versions
    .filter(version => semver.satisfies(version, `>${baseVersion}`))
    .sort((a, b) => semver.gt(b, a) ? 1 : -1);
}

// get remote npm latest version
async function getNpmSemverVersion(baseVersion, npmName, registry) {
    const versions = await getNpmVersions(npmName, registry);
    const newVersions = getSemverVersions(baseVersion, versions);
    if (newVersions && newVersions.length > 0) {
      return newVersions[0];
    }
    return null;
}

async function getNpmLatestVersion(npmName, registry) {
    let versions = await getNpmVersions(npmName, registry);
    if (versions) {
      return versions.sort((a, b) => semver.gt(b, a))[0];
    }
    return null;
  }

module.exports = {
    getNpmSemverVersion,
    getNpmLatestVersion,
    getNpmInfo,
}

