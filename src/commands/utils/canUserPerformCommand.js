'use strict';

const {
    timeRestrictedCommands,
    restrictedHours,
} = require('../../config/config.js');
const { groupMemberships, groups } = require('../../config/config.js');

/**
 * Checks if a user has access to perform a command
 *
 * @param {string} user
 * @param {keyof typeof import('../../config/config.js').groups | undefined} userGroup
 * @param {import('../types.d.ts').CommandPermissionInfo | undefined} permission
 * @returns {boolean}
 */
function doesUserHaveAccessToCommand(user, userGroup, permission) {
    if (!permission) {
        // Command doesn't have permissions listed
        return true;
    }

    if (permission.users && permission.users.includes(user.toLowerCase())) {
        return true;
    }

    if (permission.group && user in groupMemberships) {
        if (permission.group === userGroup) {
            // User is in the exact group required
            return true;
        }

        // At this point, the user is in a group but it's not the one that's listed.
        //  However, they can still run the command if their group outranks the
        //  group that's listed (i.e. admin can run mod commands, but operator
        //  can't run mod commands)
        //
        // Noteworthy that the ranks are defined in reverse order, meaning a group
        //  with a rank of 0 has a higher ranking than a group of 1.

        const minimumRank = groups[permission.group];
        const userRank = groups[userGroup];

        if (minimumRank === userRank) {
            // Different group, same rank. Shouldn't happen, but there's also nothing
            //  preventing it from happening
            return false;
        }

        if (minimumRank > userRank) {
            // User has permission
            return true;
        }
    }

    return false;
}

/**
 * @param {keyof typeof import('../../config/config.js').groups | undefined} userGroup
 * @param {import('../types.d.ts').Command} command
 * @param {import('../../controller.js')} controller
 * @returns {boolean}
 */
function isCommandTimeRestricted(userGroup, command, controller) {
    if (
        controller.connections.database.timeRestrictionDisabled ||
        command.skipTimeRestrictionCheck === true ||
        !(command.name in timeRestrictedCommands)
    ) {
        // Time restrictions are disabled or the command isn't time restricted
        return false;
    }

    if (userGroup === 'admin' || userGroup === 'superUser') {
        return true;
    }

    const now = new Date();
    const hour = now.getUTCHours();

    if (hour >= restrictedHours.start && hour < restrictedHours.end) {
        // Command can't be ran
        return true;
    }

    return false;
}

/**
 * @param {string} user
 * @param {import('../types.d.ts').Command} command
 * @param {import('../../controller.js')} controller
 * @returns {boolean}
 */
function canUserPerformCommand(user, command, controller) {
    const userGroup = groupMemberships[user];

    return (
        doesUserHaveAccessToCommand(user, userGroup, command.permission) &&
        !isCommandTimeRestricted(userGroup, command, controller)
    );
}

module.exports = {
    isCommandTimeRestricted,
    canUserPerformCommand,
};
