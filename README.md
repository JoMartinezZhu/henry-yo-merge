# henry-yo-merge

yeoman custom ui to resolve conflict with vscode.

This module provides some custom yeoman components.

* Adapter
* Conflicter
* Logger

When the conflict has occured, this module provides the custom action `merge(m)`, and by default you can resolve the conflict with `vscode`.

For example,

```
$ yo merge-foo
 conflict foo.txt
? Overwrite foo.txt? (ynaxdmH) m
>> merge the old and the new with vscode
```

and then, open application vscode resolve the conflict

## Install

```
$ npm install --save henry-yo-merge
```

## Usage

Define your custom yeoman Generator.

```javascript
const Generator = require('yeoman-generator');
const { Conflicter, Adapter } = require('henry-yo-merge');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.env.adapter = new Adapter();
    this.conflicter = new Conflicter(this.env.adapter, this.options.force);
  }
}
```