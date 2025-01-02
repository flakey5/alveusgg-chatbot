'use strict';

const { cleanName } = require('../../utils/helper.js');

/**
 * @param {import('../../connections/obs.js').OBSConnection} obs
 * @returns {string}
 */
module.exports = (obs) => {
    const currentScene = obs.local?.currentScene ?? '';

    return cleanName(currentScene);
};
