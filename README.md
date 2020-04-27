# expressjs-check
**A simple library for data validation.**

expressjs-check allows pattern-based data validation. This build is specifically implemented to support expressJS functionalities, such as auto-respond with error messages.

## Installation and Setup
You can install expressjs-check by simply entering the command `npm i expressjs-check`. Once it has installed you can use it in your Express app however you'd like. Below is a little example:

```js
const express = require('express');
const app = express();
const port = 3000;

const checker = require('expressjs-check');

app.get('/', (req, res) => {

    // Check GET Parameters
    if(checker.check(req.query, res, {
        someString: {type:"string", required:true}
    })) return;

    // If parameter "someString" is passed
    res.status(200);
    res.send({ok:true});
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
```

## Pattern Documentation:
Patterns are JSON Objects defining a certain format of values that should be checked. Every key in the pattern object represents a key of the same name in the check-object. The check() function returns false if all given parameters are valid, true otherwise.

### Required Parameters
Values can be set as required using `required:true`. If `null` should be allowed, `allowNull:true` must be set. Values can be set as required conditionally by using the `requiredIf` attribute. This allows for a JS-string to be passed that evaluates to either true or false, deciding whether or not the value is required. Other values in the object can be accessed using `#keyname`, for example:

`'#somenumber === 1'` will make the value required if the value `somenumber` is equal to 1.

### Data Types
Data Types can be checked using the `type` key in the pattern. Supported Types are as follows:
 * `string`
   - `minLength` : Minimum length of the string
   - `maxLength` : Maximum length of the string
   - `regex` : Regular Expression the string needs to match (passed as a string)
 * `boolean`
 * `date`
   - `min` : Earliest possible date
   - `max` : Latest possible date
   - `allowTimestamp` : Allows Numbers to be passed as timestamps
 * `number`
   - `min` : Minimum value
   - `max` : Maximum value
   - `precision` : Maximum amount of allowed decimal places
 * `integer`: Same attributes as `number`, but does not allow decimal places.

### Example Patterns:
```js
// Check for a valid number larger than or equal to 10:
{
	testNumber: {
		required: true,
		type: 'number',
		min: 10
	}
}

// Check for a simple Email address string:
{
	email: {
		required: true,
		type: 'string',
		regex: '.+@.+\..+'
	}
}
```