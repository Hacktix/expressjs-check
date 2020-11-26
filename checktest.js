const check = require("./check").check;
const res = {status: function(){}, send: function(){}};

require('colors');

var checks = 0;
var passed = 0;

function doCheck(title, input, pattern, expected = false) {
    checks++;
    let r = check(input, res, pattern);
    if(r != expected) console.log(" [x] ".brightRed + ("Expected " + expected + " but got " + r + " for check '" + title + "'").white);
    else {
        console.log(" [o] ".brightGreen + ("Passed test for check '" + title + "'").white);
        passed++;
    }
}

function doResultCheck(title, input, pattern, expectedInput, expected = false) {
    checks++;
    let r = check(input, res, pattern);
    if(r != expected) console.log(" [x] ".brightRed + ("Expected " + expected + " but got " + r + " for check '" + title + "'").white);
    else {
        let ei = true;
        for(let key in expectedInput) {
            if(!compareValues(input[key], expectedInput[key])) {
                console.log(" [x] ".brightRed + ("Expected " + expectedInput[key] + " for key " + key + " but got " + input[key] + " for check '" + title + "'").white);
                ei = false;
                break;
            }
        }
        if(ei) {
            console.log(" [o] ".brightGreen + ("Passed test for check '" + title + "'").white);
            passed++;
        }
    }
}

function doExceptionCheck(title, input, pattern, expected = false, exceptionType = "Exception") {
    checks++;
    let r = false;
    let msg = "";
    try {
        check(input, res, pattern);
    } catch(e) {
        r = true;
        msg = e.toString().split(":")[0];
    }
    if(r != expected || msg != exceptionType) console.log(" [x] ".brightRed + ("Expected " + (expected ? exceptionType : "no exception") + " but got " + (expected ? "none" : msg) + " for check '" + title + "'").white);
    else {
        console.log(" [o] ".brightGreen + ("Passed test for check '" + title + "'").white);
        passed++;
    }
}

function compareValues(o1, o2) {
	if(typeof o1 !== typeof o2)
		return false;
	if(typeof o1 !== "object" || o1 === null || o2 === null)
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

console.log("\n=== Number Type ===");
doCheck("Positive Integer", {a:1}, {a:{type:"number"}});
doCheck("Positive Float", {a:1.5}, {a:{type:"number"}});
doCheck("Negative Integer", {a:-7}, {a:{type:"number"}});
doCheck("Negative Float", {a:-18.3923}, {a:{type:"number"}});
doCheck("String formatted integer", {a:"15"}, {a:{type:"number"}});
doCheck("String formatted float", {a:"7.3823"}, {a:{type:"number"}});
doCheck("String", {a:"test"}, {a:{type:"number"}}, true);
doCheck("Object", {a:{random:"test"}}, {a:{type:"number"}}, true);
doCheck("Integer below Max", {a:6}, {a:{type:"number", max:10}});
doCheck("Integer above Max", {a:16}, {a:{type:"number", max:10}}, true);
doCheck("Integer below Min", {a:6}, {a:{type:"number", min:10}}, true);
doCheck("Integer above Min", {a:16}, {a:{type:"number", min:10}});
doCheck("Integer with precision filter", {a:6}, {a:{type:"number", precision:5}});
doCheck("Float below Max", {a:6.1}, {a:{type:"number", max:10}});
doCheck("Float above Max", {a:16.1}, {a:{type:"number", max:10}}, true);
doCheck("Float below Min", {a:6.1}, {a:{type:"number", min:10}}, true);
doCheck("Float above Min", {a:16.1}, {a:{type:"number", min:10}});
doCheck("Float over max precision", {a:6.12345}, {a:{type:"number", precision:3}}, true);
doCheck("Float under max precision", {a:6.12345}, {a:{type:"number", precision:5}});
doCheck("undefined - not required", {a:undefined}, {a:{type:"number"}});
doCheck("null - not required", {a:null}, {a:{type:"number"}});
doCheck("undefined - required", {a:undefined}, {a:{type:"number", required:true}}, true);
doCheck("null - required", {a:null}, {a:{type:"number", required:true}}, true);
doCheck("null - allowed", {a:null}, {a:{type:"number", required:true, allowNull:true}});
doCheck("Infinity", {a:Infinity}, {a:{type:"number"}}, true);

console.log("\n=== Integer Type ===");
doCheck("Positive Integer", {a:1}, {a:{type:"integer"}});
doCheck("Positive Float", {a:1.5}, {a:{type:"integer"}}, true);
doCheck("Negative Integer", {a:-7}, {a:{type:"integer"}});
doCheck("Negative Float", {a:-18.3923}, {a:{type:"integer"}}, true);
doCheck("Below Max", {a:6}, {a:{type:"integer", max:10}});
doCheck("Above Max", {a:16}, {a:{type:"integer", max:10}}, true);
doCheck("Below Min", {a:6}, {a:{type:"integer", min:10}}, true);
doCheck("Above Min", {a:16}, {a:{type:"integer", min:10}});
doCheck("undefined - not required", {a:undefined}, {a:{type:"integer"}});
doCheck("null - not required", {a:null}, {a:{type:"integer"}});
doCheck("undefined - required", {a:undefined}, {a:{type:"integer", required:true}}, true);
doCheck("null - required", {a:null}, {a:{type:"integer", required:true}}, true);
doCheck("null - allowed", {a:null}, {a:{type:"integer", required:true, allowNull:true}});
doCheck("Infinity", {a:Infinity}, {a:{type:"integer"}}, true);

console.log("\n=== String Type ===");
doCheck("Integer", {a:1}, {a:{type:"string"}}, true);
doCheck("Float", {a:1.5}, {a:{type:"string"}}, true);
doCheck("String", {a:"abc"}, {a:{type:"string"}});
doCheck("Boolean", {a:true}, {a:{type:"string"}},true)
doCheck("undefined - not required", {a:undefined}, {a:{type:"string"}});
doCheck("null - not required", {a:null}, {a:{type:"string"}});
doCheck("undefined - required", {a:undefined}, {a:{type:"string", required:true}}, true);
doCheck("null - required", {a:null}, {a:{type:"string", required:true}}, true);
doCheck("null - allowed", {a:null}, {a:{type:"string", required:true, allowNull:true}});
doCheck("Infinity", {a:Infinity}, {a:{type:"string"}}, true);
doCheck("Below minLength", {a:"abc"}, {a:{type:"string",minLength:5}},true);
doCheck("Above minLength", {a:"abcdefg"}, {a:{type:"string",minLength:5}});
doCheck("Exactly minLength", {a:"abcde"}, {a:{type:"string",minLength:5}});
doCheck("Below maxLength", {a:"abc"}, {a:{type:"string",maxLength:5}});
doCheck("Above maxLength", {a:"abcdefg"}, {a:{type:"string",maxLength:5}},true);
doCheck("Exactly maxLength", {a:"abcde"}, {a:{type:"string",maxLength:5}});
doCheck("Below fixedLength", {a:"abc"}, {a:{type:"string",fixedLength:5}},true);
doCheck("Above fixedLength", {a:"abcdefg"}, {a:{type:"string",fixedLength:5}},true);
doCheck("Exactly fixedLength", {a:"abcde"}, {a:{type:"string",fixedLength:5}});
doCheck("Number regex - match", {a:"12345"}, {a:{type:"string",regex:"\\d+"}});
doCheck("Number regex - partial mismatch", {a:"a12345"}, {a:{type:"string",regex:"\\d+"}},true);
doCheck("Number regex - full mismatch", {a:"abc"}, {a:{type:"string",regex:"\\d+"}},true);
doCheck("Email regex - match", {a:"example@example.com"}, {a:{type:"string",regex:".+@.+\\..+"}});
doCheck("Email regex - partial mismatch", {a:"example@example"}, {a:{type:"string",regex:".+@.+\\..+"}},true);
doCheck("Email regex - full mismatch", {a:"17932"}, {a:{type:"string",regex:".+@.+\\..+"}},true);
doCheck("Time regex - match", {a:"10:10"}, {a:{type:"string",regex:"([0-1][0-9]|2[0-3]):[0-5][0-9]"}});
doCheck("Time regex - partial mismatch", {a:"10:aaaaaaa"}, {a:{type:"string",regex:"([0-1][0-9]|2[0-3]):[0-5][0-9]"}},true);
doCheck("Time regex - full mismatch", {a:"abcdefg"}, {a:{type:"string",regex:"([0-1][0-9]|2[0-3]):[0-5][0-9]"}},true);
doCheck("Regex flags - Case Insensitive", {a:"ABcdEF"}, {a:{type:"string",regex:"ABCDEF",regexFlags:"i"}});
doCheck("Regex flags - Multiline", {a:"abc"}, {a:{type:"string",regex:"^abc$",regexFlags:"m"}});

console.log("\n=== Boolean Type ===");
doCheck("Integer", {a:1}, {a:{type:"boolean"}}, true);
doCheck("Float", {a:1.5}, {a:{type:"boolean"}}, true);
doCheck("String", {a:"abc"}, {a:{type:"boolean"}},true);
doCheck("Boolean - true", {a:true}, {a:{type:"boolean"}});
doCheck("Boolean - false", {a:false}, {a:{type:"boolean"}});
doCheck("undefined - not required", {a:undefined}, {a:{type:"boolean"}});
doCheck("null - not required", {a:null}, {a:{type:"boolean"}});
doCheck("undefined - required", {a:undefined}, {a:{type:"boolean", required:true}}, true);
doCheck("null - required", {a:null}, {a:{type:"boolean", required:true}}, true);
doCheck("null - allowed", {a:null}, {a:{type:"boolean", required:true, allowNull:true}});
doCheck("Infinity", {a:Infinity}, {a:{type:"boolean"}}, true);

console.log("\n=== Date Type ===");
doCheck("Integer", {a:1}, {a:{type:"date"}}, true);
doCheck("Float", {a:1.5}, {a:{type:"date"}}, true);
doCheck("String", {a:"abc"}, {a:{type:"date"}},true);
doCheck("Boolean - true", {a:true}, {a:{type:"date"}},true);
doCheck("Boolean - false", {a:false}, {a:{type:"date"}},true);
doCheck("Current Date", {a:new Date()}, {a:{type:"date"}});
doCheck("Timestamp - allowed", {a:0}, {a:{type:"date",allowTimestamp:true}});
doCheck("Timestamp - disallowed", {a:0}, {a:{type:"date",allowTimestamp:false}},true);
doCheck("Date below min", {a:new Date(0)}, {a:{type:"date",min:new Date()}},true);
doCheck("Date above min", {a:new Date()}, {a:{type:"date",min:new Date(0)}});
doCheck("Date below max", {a:new Date(0)}, {a:{type:"date",max:new Date()}});
doCheck("Date above max", {a:new Date()}, {a:{type:"date",max:new Date(0)}},true);
doCheck("Timestamp below min", {a:0}, {a:{type:"date",min:new Date(),allowTimestamp:true}},true);
doCheck("Timestamp above min", {a:99999999999}, {a:{type:"date",min:new Date(0),allowTimestamp:true}});
doCheck("Timestamp below max", {a:0}, {a:{type:"date",max:new Date(),allowTimestamp:true}});
doCheck("Timestamp above max", {a:99999999999}, {a:{type:"date",max:new Date(0),allowTimestamp:true}},true);

console.log("\n=== Object Type ===");
doCheck("Number", {a:1}, {a:{type:"object"}}, true);
doCheck("String", {a:"abc"}, {a:{type:"object"}}, true);
doCheck("Function", {a:console.log}, {a:{type:"object"}}, true);
doCheck("Empty Object", {a:{}}, {a:{type:"object"}});
doCheck("Filled Object", {a:{a:1,b:2,c:3}}, {a:{type:"object"}});
doCheck("Nested Pattern - Invalid", {a:{a:1,b:2,c:3}}, {a:{type:"object",pattern:{a:{type:"number"},b:{type:"string"},c:{type:"object"}}}}, true);
doCheck("Nested Pattern - Valid", {a:{a:1,b:"abc",c:{}}}, {a:{type:"object",pattern:{a:{type:"number"},b:{type:"string"},c:{type:"object"}}}});
doCheck("Double Nested Pattern - Invalid", {a:{a:{a:"abc"}}}, {a:{type:"object",pattern:{a:{type:"object",pattern:{a:{type:"number"}}}}}}, true);
doCheck("Double Nested Pattern - Valid", {a:{a:{a:1}}}, {a:{type:"object",pattern:{a:{type:"object",pattern:{a:{type:"number"}}}}}});

console.log("\n=== Array Type ===");
doCheck("Number", {a:1}, {a:{type:"array"}}, true);
doCheck("String", {a:"abc"}, {a:{type:"array"}}, true);
doCheck("Function", {a:console.log}, {a:{type:"array"}}, true);
doCheck("Empty Object", {a:{}}, {a:{type:"array"}},true);
doCheck("Filled Object", {a:{a:1,b:2,c:3}}, {a:{type:"array"}},true);
doCheck("Almost-array Object", {a:{"0":1,"1":2,"3":3}}, {a:{type:"array"}},true);
doCheck("Empty Array", {a:[]}, {a:{type:"array"}});
doCheck("Filled Array", {a:[1,2,3]}, {a:{type:"array"}});
doCheck("Array with Pattern - match", {a:[1,2,3]}, {a:{type:"array", pattern:{type:"number"}}});
doCheck("Array with Pattern - mismatch", {a:[1,2,3]}, {a:{type:"array", pattern:{type:"string"}}},true);
doCheck("Below minLength", {a:[1]}, {a:{type:"array",minLength:2}},true);
doCheck("Above minLength", {a:[1,2,3]}, {a:{type:"array",minLength:2}});
doCheck("Exactly minLength", {a:[1,2]}, {a:{type:"array",minLength:2}});
doCheck("Below maxLength", {a:[1]}, {a:{type:"array",maxLength:2}});
doCheck("Above maxLength", {a:[1,2,3]}, {a:{type:"array",maxLength:2}},true);
doCheck("Exactly maxLength", {a:[1,2]}, {a:{type:"array",maxLength:2}});
doCheck("Below fixedLength", {a:[1]}, {a:{type:"array",fixedLength:2}},true);
doCheck("Above fixedLength", {a:[1,2,3]}, {a:{type:"array",fixedLength:2}},true);
doCheck("Exactly fixedLength", {a:[1,2]}, {a:{type:"array",fixedLength:2}});

console.log("\n=== RequiredIf ===");
doCheck("required, not given", {a:1}, {a:{type:"number"}, b:{type:"string",requiredIf:"#a===1"}}, true);
doCheck("required, valid", {a:1,b:"abc"}, {a:{type:"number"}, b:{type:"string",requiredIf:"#a===1"}});
doCheck("required, invalid", {a:1,b:[]}, {a:{type:"number"}, b:{type:"string",requiredIf:"#a===1"}},true);
doCheck("not required, not given", {a:1}, {a:{type:"number"}, b:{type:"string",requiredIf:"#a===2"}});
doCheck("not required, valid", {a:1,b:"abc"}, {a:{type:"number"}, b:{type:"string",requiredIf:"#a===2"}});
doCheck("not required, invalid", {a:1,b:[]}, {a:{type:"number"}, b:{type:"string",requiredIf:"#a===2"}},true);
doCheck("nested, required, not given", {a:{num:1}}, {a:{type:"object",pattern:{b:{type:"string",requiredIf:"#a.num===1"}}}},true);
doCheck("nested, required, valid", {a:{num:1,b:"abc"}}, {a:{type:"object",pattern:{b:{type:"string",requiredIf:"#a.num===1"}}}});
doCheck("nested, required, invalid", {a:{num:1,b:3.5}}, {a:{type:"object",pattern:{b:{type:"string",requiredIf:"#a.num===1"}}}},true);
doCheck("RCE", {get a() { console.log("RCE") }}, {b: {requiredIf:"#a"}});

console.log("\n=== PossibleValues ===");
doCheck("Not given, not required", {}, {a:{type:"number", possibleValues:[1,2,3]}});
doCheck("Not given, required", {}, {a:{type:"number", required:true, possibleValues:[1,2,3]}}, true);
doCheck("Valid", {a:1}, {a:{type:"number", possibleValues:[1,2,3]}});
doCheck("Invalid", {a:0}, {a:{type:"number", possibleValues:[1,2,3]}},true);
doCheck("Wrong data type", {a:0}, {a:{type:"string", possibleValues:[1,2,3]}},true);
doCheck("Object, valid", {a:{a:1}}, {a:{type:"object", possibleValues:[{a:1}]}});
doCheck("Object, invalid - different values", {a:{a:1}}, {a:{type:"object", possibleValues:[{a:2}]}}, true);
doCheck("Object, invalid - different keys", {a:{a:1}}, {a:{type:"object", possibleValues:[{b:1}]}}, true);
doCheck("Object, invalid - different key amount", {a:{a:1}}, {a:{type:"object", possibleValues:[{a:1, b:1}]}}, true);
doCheck("Object, invalid - different key amount", {a:{a:1}}, {a:{type:"object", possibleValues:[{a:1, b:1}]}}, true);

console.log("\n=== removeDuplicates / noDuplicates ===");
doCheck("No duplicates, duplicate check off", {a: [1,2,3]}, {a:{type:"array"}});
doCheck("Duplicates, duplicate check off", {a: [1,1,1]}, {a:{type:"array"}});
doCheck("No duplicates, duplicate check on", {a: [1,2,3]}, {a:{type:"array", noDuplicates: true}});
doCheck("Duplicates, duplicate check on", {a: [1,1,1]}, {a:{type:"array", noDuplicates: true}}, true);
doResultCheck("No duplicates, duplicate removal off", {a: [1,2,3]}, {a:{type:"array"}}, {a:[1,2,3]});
doResultCheck("Duplicates, duplicate removal off", {a: [1,1,1]}, {a:{type:"array"}}, {a:[1,1,1]});
doResultCheck("No duplicates, duplicate removal on", {a: [1,2,3]}, {a:{type:"array", removeDuplicates: true}}, {a:[1,2,3]});
doResultCheck("Duplicates, duplicate removal on", {a: [1,1,1]}, {a:{type:"array", removeDuplicates: true}}, {a:[1]});
doCheck("Duplicate Strings", {a: ["a", "a", "b"]}, {a:{type:"array", noDuplicates: true}}, true);
doCheck("Strings, no duplicates", {a: ["a", "c", "b"]}, {a:{type:"array", noDuplicates: true}});
doCheck("Duplicate Objects", {a: [{a:1}, {a:1}, {a:2}]}, {a:{type:"array", noDuplicates: true}}, true);
doCheck("Objects, no duplicates", {a: [{a:1}, {a:2}]}, {a:{type:"array", noDuplicates: true}});
doCheck("Duplicate Nested Objects", {a: [{a:{b:1}}, {a:{b:1}}, {a:{b:2}}]}, {a:{type:"array", noDuplicates: true}}, true);
doCheck("Nested Objects, no duplicates", {a: [{a:{b:1}}, {a:{b:2}}]}, {a:{type:"array", noDuplicates: true}});

console.log("\n=== Default ===");
doResultCheck("Undefined, use default", {}, {a:{type:"integer", default:1}}, {a:1});
doResultCheck("Defined, don't use default", {a: 2}, {a:{type:"integer", default:1}}, {a:2});
doResultCheck("Null, use default", {a: null}, {a:{type:"integer", default:1, replaceNull: true}}, {a:1});
doResultCheck("Null, don't use default", {a: null}, {a:{type:"integer", default:1}}, {a:null});
doResultCheck("Null, explicitly don't use default", {a: null}, {a:{type:"integer", default:1, replaceNull: false}}, {a:null});
doResultCheck("Undefined, replaceNull activated", {}, {a:{type:"integer", default:1, replaceNull: true}}, {a:1});
doResultCheck("Undefined, replaceNull deactivated", {}, {a:{type:"integer", default:1, replaceNull: false}}, {a:1});

console.log("\n=== Syntax Errors ===");
doExceptionCheck("null arguments", null, null, true, "InvalidArgumentsException");
doCheck("null data, empty pattern", null, {});
doCheck("null data, filled pattern", null, {a:{type:"string", required:true}}, true);
doCheck("null data type", {a:1}, {a:{type:null}});
doExceptionCheck("invalid data type", {a:1}, {a:{type:"something"}}, true, "InvalidArgumentsException");

console.log("\n=== Results ===");
console.log("Passed ".white + passed.toString().brightGreen + " out of ".white + checks.toString().brightGreen + " (".white + ((Math.floor((passed/checks)*10000)/100) + "%").brightGreen + ")\n".white);