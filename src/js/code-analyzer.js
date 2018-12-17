import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

let varHash = new Map();
let holder={};
let params = {};
let pVals = {};
let pv=[];
let trues = [];
let inFunc=false;
let numT=0;

const parseTypes = {
    'VariableDeclaration': parseVarDecl,
    'ReturnStatement': parseRetStmt,
    'FunctionDeclaration': parseFunc,
    'WhileStatement': parseWhileStmt,
    'IfStatement': parseIf,
    'BlockStatement': parseBlock,
    'ExpressionStatement': parseExpr,
    'AssignmentExpression': parseAssExpr
};

const parseCode = (codeToParse,paramsToParse) => {
    reset();
    let data = (esprima.parseScript(codeToParse));
    if (data.length === 0 || data.body.length<1)
        return '';
    let vals=paramsToParse;
    pv=eval('['+vals+']');
    data.body[0]=makeData(data.body[0]);
    return escodegen.generate(data);
};

function reset() {
    varHash = new Map();
    holder={};
    params = {};
    pVals = {};
    pv=[];
    trues = [];
    numT=0;
    inFunc=false;
}

const getLines= ()=> {
    return trues;
};

function makeData(data) {
    let x = parseTypes[data.type];
    return x(data);
}

function parseBlock(data) {
    data.body = data.body.map(makeData);
    for (let i=0;i<data.body.length;i++){
        if(data.body[i]===''){
            data.body.splice(i,1);
            i--;
        }
    }
    return data;
}

function parseExpr(data) {
    data.expression = makeData(data.expression);
    if (data.expression==='')
        data='';
    return data;
}

function parseVarDecl(data) {
    let decs = data.declarations;
    let ret;
    for (let i=0;i<decs.length;i++){
        if (inFunc){
            if(decs[i].init.type==='BinaryExpression')
                varHash.set(decs[i].id.name,parseBinaryExpr(decs[i].init));
            else if(varHash.has(decs[i].init.name)) {varHash.set(decs[i].id.name,varHash.get(decs[i].init.name));}
            else varHash.set(decs[i].id.name,decs[i].init); ret='';}
        else {
            plz(decs[i]);
            ret=data;
        }
    }
    return ret;
}
function plz(dec){
    if(dec.init.type === 'BinaryExpression'){
        pVals[dec.id.name]=eval(replace(escodegen.generate(parseBinaryExpr(dec.init))));
    }
    else pVals[dec.id.name] = eval(replace(escodegen.generate(dec.init)));
    params[dec.id.name] = dec.id.name;
}
function parseBinaryExpr(data){
    data=check(data,'left');
    data=check(data,'right');
    return data;
}

function check(data,side){
    if (data[side].type==='Identifier'){
        if (varHash.has(data[side].name))
            data[side] = varHash.get(data[side].name);

    }
    else if (data[side].type==='BinaryExpression'){
        data[side]=parseBinaryExpr(data[side]);
    }
    return data;
}

function parseRetStmt(data) {

    data.argument = data.argument.type === 'BinaryExpression'? parseBinaryExpr(data.argument): varHash.has(data.argument.name) ? varHash.get(data.argument.name): data.argument;

    return data;
}

function parseFunc(data) {
    inFunc=true;
    for (let i=0;i<data.params.length;i++){
        params[data.params[i].name]=data.params[i];
        pVals[data.params[i].name]=pv[i];
    }
    for (let i=0;i<data.body.body.length;i++){
        data.body.body[i]=makeData(data.body.body[i]);
        if(data.body.body[i]===''){
            data.body.body.splice(i,1);
            i--;
        }
    }
    return data;
}

function parseWhileStmt(data) {
    data.test=parseTest(data.test);
    for (let i=0;i<data.body.body.length;i++){
        data.body.body[i]=makeData(data.body.body[i]);
        if(data.body.body[i]===''){
            data.body.body.splice(i,1);
            i--;
        }
    }
    return data;
}

function parseTest(data){
    if (data.type==='BinaryExpression') {return parseBinaryExpr(data);}
    else {if (varHash.has(data.name)) return varHash.get(data.name); else return data;}
}

function parseIf(data) {
    data.test = parseTest(data.test);
    let val= eval(replace(escodegen.generate(data.test)));
    if (val) {trues.push(numT);}
    numT++;

    holder=varHash;
    varHash = new Map(varHash);
    data.consequent = makeData(data.consequent);

    varHash=holder;
    if (data.alternate !== null) {
        varHash = new Map(varHash);
        data.alternate = makeData(data.alternate);
    }
    varHash = holder;
    return data;
}

function parseAssExpr(data) {
    if (data.left.name in params){
        if(data.right.type === 'BinaryExpression'){
            let bin=parseBinaryExpr(data.right);
            pVals[data.left.name]=eval(replace(escodegen.generate(bin)));
            data.right=bin;
        }
        else if ( varHash.has(data.right.name)){
            pVals[data.left.name] = eval(replace(escodegen.generate(varHash.get(data.right.name))));
            data.right=varHash.get(data.right.name);
        }
        else pVals[data.left.name] = eval(replace(escodegen.generate(data.right)));
        params[data.left.name] = data.left.name;
    }
    else {
        data=stopPlz(data);
    }
    return data;
}

function stopPlz(data) {
    if(data.right.type === 'BinaryExpression'){varHash.set(data.left.name,parseBinaryExpr(data.right));}
    else varHash.set(data.left.name,varHash.has(data.right.name) ? varHash.get(data.right.name) : data.right);
    data='';
    return data;
}

function replace(data) {
    let tokens = data.split(' ');
    let line='';
    tokens.forEach(token=>{
        Object.keys(params).forEach (p=>token=token.replace(p,JSON.stringify(pVals[p])));
        line=line+' ' + token;
    });
    return line;
}
export {parseCode};
export {getLines};
