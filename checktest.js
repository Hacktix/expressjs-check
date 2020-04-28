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
doCheck("Number regex - match", {a:"12345"}, {a:{type:"string",regex:"\\d+"}});
doCheck("Number regex - partial mismatch", {a:"a12345"}, {a:{type:"string",regex:"\\d+"}},true);
doCheck("Number regex - full mismatch", {a:"abc"}, {a:{type:"string",regex:"\\d+"}},true);

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

console.log("\n=== Syntax Errors ===");

doExceptionCheck("null arguments", null, null, true, "InvalidArgumentsException");
doCheck("null data, empty pattern", null, {});
doCheck("null data, filled pattern", null, {a:{type:"string", required:true}}, true);
doCheck("null data type", {a:1}, {a:{type:null}});
doExceptionCheck("invalid data type", {a:1}, {a:{type:"something"}}, true, "InvalidArgumentsException");

console.log("\n=== Results ===");
console.log("Passed ".white + passed.toString().brightGreen + " out of ".white + checks.toString().brightGreen + " (".white + ((Math.floor((passed/checks)*10000)/100) + "%").brightGreen + ")\n".white);