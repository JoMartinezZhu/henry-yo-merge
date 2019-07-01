/**
 * The original file is
 * https://github.com/yeoman/generator/blob/edc2bf208e05ec93f98d6d0490c00778ae5790c2/lib/util/conflicter.js
 *
 * The original file is licensed under the BSD 2-clause "Simplified" License.
 * https://github.com/yeoman/generator/blob/edc2bf208e05ec93f98d6d0490c00778ae5790c2/LICENSE
 */

'use strict';

const path = require('path');
const fs = require('fs');

const binaryDiff = require('yeoman-generator/lib/util/binary-diff');
const BaseConflicter = require('yeoman-generator/lib/util/conflicter');
const typedError = require('error/typed');

const AbortedError = typedError({
    type: 'AbortedError',
    message: 'Process aborted by user',
});

module.exports = class extends BaseConflicter {
    constructor(adapter, force, options) {
        super(adapter, force);
        this._mergeOptions = options;
    }

    _ask(file, cb) {
        const rfilepath = path.relative(process.cwd(), file.path);
        const prompt = {
            name: 'action',
            type: 'expand',
            message: `Overwrite ${rfilepath}?`,
            choices: [
                {
                    key: 'y',
                    name: 'overwrite',
                    value: 'write',
                },
                {
                    key: 'n',
                    name: 'do not overwrite',
                    value: 'skip',
                },
                {
                    key: 'a',
                    name: 'overwrite this and all others',
                    value: 'force',
                },
                {
                    key: 'x',
                    name: 'abort',
                    value: 'abort',
                },
            ],
        };

        if (fs.statSync(file.path).isFile()) {
            prompt.choices.push({
                key: 'd',
                name: 'show the differences between the old and the new',
                value: 'diff',
            });
            prompt.choices.push({
                key: 'm',
                name: 'merge the old and the new with vscode',
                value: 'merge',
            });
        }

        this.adapter.prompt([prompt], result => {
            if (result.action === 'abort') {
                this.adapter.log.writeln('Aborting ...');
                throw new AbortedError();
            }

            if (result.action === 'diff') {
                if (binaryDiff.isBinary(file.path, file.contents)) {
                    this.adapter.log.writeln(binaryDiff.diff(file.path, file.contents));
                } else {
                    const existing = fs.readFileSync(file.path);
                    this.adapter.diff(existing.toString(), (file.contents || '').toString());
                }

                return this._ask(file, cb);
            }

            if (result.action === 'merge') {
                if (binaryDiff.isBinary(file.path, file.contents)) {
                    this.adapter.log.writeln(binaryDiff.diff(file.path, file.contents));
                } else {
                    // 目的文件的内容
                    const existing = fs.readFileSync(file.path);
                    const mergeContents = this.adapter.merge(
                        existing.toString(),
                        (file.contents || '').toString()
                    );
                    fs.writeFileSync(file.path, mergeContents);
                    this.adapter.log[result.action](rfilepath);
                    return cb('skip');
                }
            }

            if (result.action === 'force') {
                this.force = true;
            }

            if (result.action === 'write') {
                result.action = 'force';
            }

            this.adapter.log[result.action](rfilepath);
            return cb(result.action);
        });
    }
};
