function isNumber(num) {
    return !isNaN(parseFloat(num)) && !isNaN(num) && !(num - 1 === num);
}

function isSpecified(value) {
	return value !== undefined && value !== null;
}

/**
# Pattern Documentation:
  Patterns are JSON Objects defining a certain format of values that should be checked.
  Every key in the pattern object represents a key of the same name in the check-object.
  The check() function returns false if all given parameters are valid, true otherwise.

  Values can be set as required using 'required:true'. If 'null' should be allowed, 'allowNull:true' must be set.
  Values can be set as required conditionally by using the 'requiredIf' attribute. This allows for a JS-string to be passed that evaluates to
  either true or false, deciding whether or not the value is required. Other values in the object can be accessed using '#keyname', for example:
  '#somenumber === 1' will make the value required if the value 'somenumber' is equal to 1.
  
  Data Types can be checked using the 'type' key in the pattern. Supported Types are as follows:
 * 'string'
   - 'minLength' : Minimum length of the string
   - 'maxLength' : Maximum length of the string
   - 'regex'     : Regular Expression the string needs to match (passed as a string)
 * 'boolean'
 * 'date'
   - 'min'            : Earliest possible date
   - 'max'            : Latest possible date
   - 'allowTimestamp' : Allows Numbers to be passed as timestamps
 * 'number'
   - 'min'      : Minimum value
   - 'max'      : Maximum value
   - 'precison' : Maximum amount of allowed decimal places
 * 'integer'
   Same attributes as 'number', but does not allow decimal places.
# Example Patterns:
	* Check for a valid number larger than or equal to 10:
	{
		testNumber: {
			required: true,
			type: 'number',
			min: 10
		}
	}
	* Check for a simple Email address string:
	{
		email: {
			required: true,
			type: 'string',
			regex: '.+@.+\..+'
		}
	}
**/
function check(input, res, pattern, callback = null) {
	var results = validate(input, pattern);

	if (Object.keys(results).length > 0) {
		if (callback !== null && typeof callback === "function")
			callback(results);
		else {
			res.status(400);
			res.send({ error: Object.keys(results).map(r => r + " - " + results[r].error).join(" ; ") });
		}
		return true;
	}
	return false;
}

function validate(input, pattern) {
	let results = {}
	Object.keys(pattern).forEach(key => {
		let vPattern = pattern[key];
		if(isSpecified(vPattern.requiredIf) && (typeof vPattern.requiredIf === "string")) {
			let parsed = "";
			let inLiteral = false;
			for(let i = 0; i < vPattern.requiredIf.length; i++) {
				let c = vPattern.requiredIf[i];
				if(c === "\"" || c === "'" || c === "`") inLiteral = !inLiteral;
				else if(!inLiteral && c === '#') {
					let varname = "";
					while("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_".includes(vPattern.requiredIf[++i])) varname += vPattern.requiredIf[i];
					i--;
					parsed += "input['" + varname + "']";
				}
				else parsed += c;
			}
			if(!isSpecified(input[key])) {
				if(eval(parsed)) {
					if (input[key] === null && vPattern.allowNull)
						return;
					results[key] = { ok: false, error: "Required attribute not specified." };
					return;
				} else return;
			}
		} else {
			if (!isSpecified(input[key])) {
				if (input[key] === null && vPattern.allowNull)
					return;
				if (vPattern.required) {
					results[key] = { ok: false, error: "Required attribute not specified." };
				}
				return;
			}
		}

		let value = input[key];
		if (isSpecified(vPattern.type)) {
			switch (vPattern.type) {
				case "object":
					if (typeof value !== "object") {
						results[key] = { error: "Value is not an object." };
						return;
					}
					if(isSpecified(vPattern.pattern) && typeof vPattern.pattern === "object") {
						let recResults = validate(value, vPattern.pattern);
						Object.keys(recResults).forEach(r => results[r] = recResults[r]);
					}
					break;
				case "string":
					if (typeof value !== "string") {
						results[key] = { error: "Value is not a string." };
						return;
					}
					if (isSpecified(vPattern.minLength) && value.length < vPattern.minLength) {
						results[key] = { error: "Value is too short." };
						return;
					}
					if (isSpecified(vPattern.maxLength) && value.length > vPattern.maxLength) {
						results[key] = { error: "Value is too long." };
						return;
					}
					if (isSpecified(vPattern.regex) && !(new RegExp(vPattern.regex).test(value))) {
						results[key] = { error: "Value is not in the correct format." };
						return;
					}
					break;
				case "boolean":
					if (typeof value !== "boolean") {
						results[key] = { error: "Value is not a boolean." };
						return;
					}
					break;
				case "date":
					if (new Date(value).toString() === "Invalid Date") {
						results[key] = { error: "Value is not a valid date." };
						return;
					}
					if (isNumber(value)) {
						if (!isSpecified(vPattern.allowTimestamp) || (isSpecified(vPattern.allowTimestamp) && !vPattern.allowTimestamp)) {
							results[key] = { error: "Value is not a valid date." };
							return;
						}
					}
					let date = new Date(value);
					if (isSpecified(vPattern.min) && date.getTime() < vPattern.min.getTime()) {
						results[key] = { error: "Value is too low." };
						return;
					}
					if (isSpecified(vPattern.max) && date.getTime() > vPattern.max.getTime()) {
						results[key] = { error: "Value is too high." };
						return;
					}
					break;
				case "number":
					if (!isSpecified(value) || !isNumber(value)) {
						results[key] = { error: "Value is not a number." };
						return;
					}
					if (isSpecified(vPattern.min) && value < vPattern.min) {
						results[key] = { error: "Value is too low." };
						return;
					}
					if (isSpecified(vPattern.max) && value > vPattern.max) {
						results[key] = { error: "Value is too high." };
						return;
					}
					if(isSpecified(vPattern.precision) && value.toString().includes(".") && value.toString().split(".")[1].length > vPattern.precision) {
						results[key] = { error: "Value has too many decimal places." };
						return;
					}
					break;
				case "integer":
					if (!isNumber(value) || value.toString().includes(".") || value.toString().includes(",")) {
						results[key] = { error: "Value is not an integer." };
						return;
					}
					if (isSpecified(vPattern.min) && value < vPattern.min) {
						results[key] = { error: "Value is too low." };
						return;
					}
					if (isSpecified(vPattern.max) && value > vPattern.max) {
						results[key] = { error: "Value is too high." };
						return;
					}
					break;
			}
		}
	});
	return results;
}

module.exports = {
	check: check,
	isNumber: isNumber,
	isSpecified: isSpecified
}