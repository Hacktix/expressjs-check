function isNumber(num) {
    return !isNaN(parseFloat(num)) && !isNaN(num) && !(num - 1 === num);
}

function isSpecified(value) {
	return value !== undefined && value !== null;
}

function compareValues(o1, o2) {
	if(typeof o1 !== typeof o2)
		return false;
	if(typeof o1 !== "object")
		return o1 === o2;
	return compareObject(o1, o2);
}

function compareObject(o1, o2) {
	if(Object.keys(o1).length !== Object.keys(o2).length)
		return false;
	for(let i = 0; i < Object.keys(o1).length; i++) {
		if(Object.keys(o1)[i] !== Object.keys(o2)[i])
			return false;
		if(!compareValues(o1[Object.keys(o1)[i]], o2[Object.keys(o1)[i]]))
			return false;
	}
	return true;
}

function check(input, res, pattern, callback = null) {
	if(!isSpecified(pattern))
		throw "InvalidArgumentsException: No pattern object provided";
	if(!isSpecified(input))
		input = {};

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

function validate(input, pattern, globalInput = null) {
	let results = {}
	Object.keys(pattern).forEach(key => {
		let vPattern = pattern[key];
		if(isSpecified(vPattern.requiredIf) && (typeof vPattern.requiredIf === "string")) {
			if(globalInput === null) globalInput = input;
			let parsed = "";
			let inLiteral = false;
			for(let i = 0; i < vPattern.requiredIf.length; i++) {
				let c = vPattern.requiredIf[i];
				if(c === "\"" || c === "'" || c === "`") inLiteral = !inLiteral;
				else if(!inLiteral && c === '#') {
					let varname = "";
					while("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_".includes(vPattern.requiredIf[++i])) varname += vPattern.requiredIf[i];
					i--;
					if(Object.keys(globalInput).includes(varname))
						parsed += "globalInput['" + varname + "']";
					else
						parsed += "false";
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

		if(isSpecified(vPattern.possibleValues)) {
			let inValidRange = false;
			for(let i = 0; i < vPattern.possibleValues.length; i++) {
				if(compareValues(vPattern.possibleValues[i], value)) {
					inValidRange = true;
					break;
				}
			}
			if(!inValidRange) {
				results[key] = { error: "Value is not in the list of valid values." };
				return;
			}
		}

		if (isSpecified(vPattern.type)) {
			switch (vPattern.type) {
				case "array":
					if (typeof value !== "object") {
						results[key] = { error: "Value is not an array." };
						return;
					}
					if(Object.keys(value).length == 0) {
						if(!isSpecified(value.length)) {
							results[key] = { error: "Value is not an array." };
							return;
						}
					}
					let lastIndex = -1;
					for(let i = 0; i < Object.keys(value).length; i++) {
						if(!isNumber(Object.keys(value)[i]) || parseInt(Object.keys(value)[i]) - 1 != lastIndex) {
							results[key] = { error: "Value is not an array." };
							return;
						} else
							lastIndex = parseInt(Object.keys(value)[i]);
					}
					if(isSpecified(vPattern.pattern) && typeof vPattern.pattern === "object") {
						let newPattern = {};
						for(let i = 0; i < value.length; i++)
							newPattern[i] = vPattern.pattern;
						let arrResults = validate(value, newPattern, globalInput === null ? input : globalInput);
						if(Object.keys(arrResults).length > 0) {
							results[key] = { error: "At least one array item does not fit pattern." };
							return;
						}
					}
					if(isSpecified(vPattern.fixedLength)) {
						if(value.length != vPattern.fixedLength) {
							results[key] = { error: "Value contains incorrect amount of items." };
							return;
						}
					} else {
						if (isSpecified(vPattern.minLength) && value.length < vPattern.minLength) {
							results[key] = { error: "Value contains too little items." };
							return;
						}
						if (isSpecified(vPattern.maxLength) && value.length > vPattern.maxLength) {
							results[key] = { error: "Value contains too many items." };
							return;
						}
					}
					break;
				case "object":
					if (typeof value !== "object") {
						results[key] = { error: "Value is not an object." };
						return;
					}
					if(isSpecified(vPattern.pattern) && typeof vPattern.pattern === "object") {
						let recResults = validate(value, vPattern.pattern, globalInput === null ? input : globalInput);
						Object.keys(recResults).forEach(r => results[r] = recResults[r]);
					}
					break;
				case "string":
					if (typeof value !== "string") {
						results[key] = { error: "Value is not a string." };
						return;
					}
					if(isSpecified(vPattern.fixedLength)) {
						if(value.length != vPattern.fixedLength) {
							results[key] = { error: "Value is not of correct length." };
							return;
						}
					} else {
						if (isSpecified(vPattern.minLength) && value.length < vPattern.minLength) {
							results[key] = { error: "Value is too short." };
							return;
						}
						if (isSpecified(vPattern.maxLength) && value.length > vPattern.maxLength) {
							results[key] = { error: "Value is too long." };
							return;
						}
					}
					if (isSpecified(vPattern.regex) && (value.match(new RegExp(vPattern.regex, isSpecified(vPattern.regexFlags) ? vPattern.regexFlags : "gm")) === null || value.match(new RegExp(vPattern.regex, isSpecified(vPattern.regexFlags) ? vPattern.regexFlags : "gm"))[0] !== value)) {
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
					if (typeof value === "boolean" || new Date(value).toString() === "Invalid Date") {
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
				default:
					throw "InvalidArgumentsException: Unknown data type " + vPattern.type;
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