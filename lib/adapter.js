'use strict';
const diff = require('diff');
const chalk = require('chalk');

const TerminalAdapter = require('yeoman-environment/lib/adapter');

const logger = require('./log');

class Adapter extends TerminalAdapter {
    constructor(opts) {
        super();
        this._mergeOptions = opts || {};
    }
    updateMergeOptions(opts) {
        Object.assign(this._mergeOptions, opts);
    }

    get _colorDiffAdded() {
        return chalk.black.bgGreen;
    }

    get _colorDiffRemoved() {
        return chalk.bgRed;
    }

    _colorLines(name, str) {
        console.log(name, ':', str);
        return str
            .split('\n')
            .map(line => this[`_colorDiff${name}`](line))
            .join('\n');
    }

    // merge(contents, filename) {
    merge(actual, expected) {
        let isRemoved = false;
        let msg = diff.diffLines(actual, expected).map(str => {
            const hasLn = /(\n)$/.test(str.value);

            if (str.added) {
                if (isRemoved) {
                    str.value =
                        str.value + `${hasLn ? '' : '\n'}` + '>>>>>>>' + `${hasLn ? '\n' : ''}`;
                    isRemoved = false;
                } else {
                    str.value =
                        '<<<<<<<\n=======\n' +
                        str.value +
                        `${hasLn ? '' : '\n'}` +
                        '>>>>>>>' +
                        `${hasLn ? '\n' : ''}`;
                }

                return str.value;
            }
            if (str.removed) {
                str.value = '<<<<<<<\n' + str.value + `${hasLn ? '' : '\n'}` + '=======\n';
                isRemoved = true;
                return str.value;
            }
            return str.value;
        });

        if (isRemoved) {
            msg[msg.length - 1] = msg[msg.length - 1] + '>>>>>>>';
            isRemoved = false;
        }

        // console.log(msg);

        msg = msg.join('');
        return msg;
    }
}

Adapter.prototype.log = logger({
    colors: {
        skip: 'yellow',
        force: 'yellow',
        create: 'green',
        merge: 'green',
        invoke: 'bold',
        conflict: 'red',
        identical: 'cyan',
        info: 'gray',
    },
});
module.exports = Adapter;
