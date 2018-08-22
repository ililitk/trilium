"use strict";

const utils = require('../services/utils');

class Entity {
    /**
     * @param {object} [row] - database row representing given entity
     */
    constructor(row = {}) {
        for (const key in row) {
            this[key] = row[key];
        }

        if ('isDeleted' in this) {
            this.isDeleted = !!this.isDeleted;
        }
    }

    beforeSaving() {
        if (!this[this.constructor.primaryKeyName]) {
            this[this.constructor.primaryKeyName] = utils.newEntityId();
        }

        const origHash = this.hash;

        this.hash = this.generateHash();

        this.isChanged = origHash !== this.hash;
    }

    generateHash() {
        let contentToHash = "";

        for (const propertyName of this.constructor.hashedProperties) {
            contentToHash += "|" + this[propertyName];
        }

        return utils.hash(contentToHash).substr(0, 10);
    }

    async save() {
        await require('../services/repository').updateEntity(this);

        return this;
    }
}

module.exports = Entity;