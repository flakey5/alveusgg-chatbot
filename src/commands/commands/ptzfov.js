'use strict';

const getCurrentScene = require('../utils/getCurrentScene.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obsBot } }) => {
    return {
        name: 'ptzfov',
        enabled: !!obsBot,
        permission: {
            group: 'operator',
        },
        run: ({ args }) => {
            const currentScene = getCurrentScene();

            if (args.length === 0 || currentScene !== 'nuthouse') {
                return;
            }

            const fov = args[1].trim().toLowerCase();

            obsBot.setFOV(fov);
        },
    };
};
