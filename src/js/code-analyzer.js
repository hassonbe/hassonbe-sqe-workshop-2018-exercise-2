import * as esprima from 'esprima';
let dict =  new Map();
let lValue = false;
let givenParams = undefined;
let functionParams = [];
let newline='<br>';

// change all the /n to <br>
/*function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
}*/
function parseBinaryExpression(expr) {
    let right = typeof parseExpr(expr.right) ==='string' ? parseExpr(expr.right) :JSON.stringify (parseExpr(expr.right));
    let left =   typeof parseExpr(expr.left) ==='string' ? parseExpr(expr.left) :JSON.stringify (parseExpr(expr.left));
    let operator =  expr.operator;
    return '('+left.concat(' ',operator,' ',right,')');
}
function parseParams (expr){
    return expr.name;
}
function parseFunction(parsed) {
    let params = parsed.params.map(parseParams);
    let i =0;
    if(givenParams.length >0) {
        for (const param of params) {
            dict.set(param, givenParams[i]);
            i++;
        }
    }
    //need to delete all params from dict
    functionParams=params;
    let body =parseExpr(parsed.body);
    functionParams=[];
    let subedFunc = 'function '+parseExpr(parsed.id)+' ('+params.join()+'){'+body+newline+'}';
    return subedFunc;
}

/*function parseLoc(loc){
    return (loc.start.line);
}*/
function parseUnaryExpression(expr){
    return expr.operator+parseExpr(expr.argument);
}
function parseReturn(retExpr) {
    return newline+'return '+parseExpr(retExpr.argument)+';';
    //return{line:parseLoc(retExpr.loc),type:'return statement',name:'',condition:'',value:parseExpr(retExpr.argument)};
}

function parseMember(expr) {
    return parseExpr(expr.object)+'['+parseExpr(expr.property)+']';
}

function parseIdentifier(expr) {
    if(!lValue) {
        return symbolicSubAll(expr.name);
    }
    else{
        return expr.name;
    }
}

function parseLiteral(expr) {
    return expr.value;
}

function parseExprStatement(expr) {
    return parseExpr(expr.expression);
}
function parseVarDeclarator(expr) {
    let value = expr.init == null||undefined ?'': parseExpr(expr.init);
    let name =parseExpr(expr.id);
    dict.set(name,symbolicSubAll(value));
}
function parseBlock(expr) {
    return expr.body.map(parseExpr).join(' ');
}

/*function parseFor(expr) {
    let body = parseExpr(expr.body);
    let test =parseExpr(expr.test);
    let init = parseExpr(expr.init);
    let update = parseExpr(expr.update);
    return [{line:parseLoc(expr.loc),type:'for statement',name:'',condition:test,value:''}].concat(init,update,body);
}

function parseUpdate(expr) {
    let name = parseExpr(expr.argument);
    let line =parseLoc( (expr.argument.loc));
    return {line:line,type:'update expression',name:name,condition:'',value:(name+expr.operator)};
}*/

function parseLogicalExpr(expr) {
    let right = typeof parseExpr(expr.right) ==='string' ? parseExpr(expr.right) :JSON.stringify (parseExpr(expr.right));
    let left =   typeof parseExpr(expr.left) ==='string' ? parseExpr(expr.left) :JSON.stringify (parseExpr(expr.left));
    let operator =  expr.operator;
    return '('+left.concat(' ',operator,' ',right,')');
}

function cont3(expr) {
    return expr.type === 'BlockStatement' ? parseBlock(expr):
        expr.type === 'LogicalExpression' ? parseLogicalExpr(expr):
            Error('unrecognized expression: '+expr.type);
}

function parseExpr(expr) {
    let cont2 = (expr)=>
        expr.type === 'Literal' ? parseLiteral(expr):
            expr.type === 'MemberExpression' ? parseMember(expr):
                expr.type === 'AssignmentExpression' ? parseAssignment(expr):
                    expr.type === 'FunctionDeclaration' ? parseFunction(expr) :
                        cont3(expr);
    let cont1 = (expr)=>
        expr.type === 'ReturnStatement' ? parseReturn(expr):
            expr.type === 'BinaryExpression' ? parseBinaryExpression(expr):
                expr.type === 'UnaryExpression' ?parseUnaryExpression(expr):
                    expr.type === 'Identifier' ? parseIdentifier(expr):
                        cont2(expr);
    return expr.type === 'VariableDeclaration' ? parseVarDecl(expr) :
        expr.type === 'ExpressionStatement' ? parseExprStatement(expr) :
            expr.type === 'WhileStatement' ? parseWhile(expr) :
                expr.type === 'IfStatement' ? parseIfExp(expr,'null') :
                    cont1(expr);
}
function parseVarDecl(varDec) {
    varDec.declarations.map(parseVarDeclarator);
}
function parseAssignment(expr) {
    let value = parseExpr(expr.right);
    lValue=true;
    let left =parseExpr(expr.left);
    lValue=false;
    if(functionParams.includes(left)|| expr.left.type === 'MemberExpression'){
        return newline+''+left+' = '+value+';';
    }
    dict.set(left,symbolicSubAll(value));
}
function parseWhile(expr) {
    let body = parseExpr(expr.body);
    return newline+'while('+parseExpr(expr.test)+')'+'{'+body+newline+'}';
}
function parseIfExp(expr,isAlternate) {
    let savedDict =new Map(dict);
    let consequent = parseExpr(expr.consequent);
    dict = savedDict;
    let test =parseExpr(expr.test);
    let testRes;
    try {
        testRes = eval(test);
    }
    catch (e) {
        testRes = 'white';
    }
    let color = testRes === true ? 'style="background-color:green;">' : testRes==='white'? '>': 'style="background-color:red;">';
    savedDict =new Map(dict);
    let alternate =alter(expr.alternate);
    dict=savedDict;
    let parEnd = '</p> ';
    let type = isAlternate === 'elseIf' ? 'else if' :  'if';
    return '<p '+color+type+'('+test+')'+parEnd+'{'+consequent+newline+'}'+alternate;
}
function alter (alternate){
    return alternate===null ? '':alternate.type ==='IfStatement' ? parseIfExp(alternate,'elseIf'):newline+'else{ '+parseExpr(alternate)+newline+'}';
}

const parseCode = (codeToParse,params) => {
    givenParams = JSON.parse('['+params+']');
    let parsed = esprima.parseScript(codeToParse,{loc: true});
    dict= new Map();
    let result =(parsed.body.map(parseExpr)).filter(function (element) {//was flattened once
        return element != null;
    })[0];
    dict= new Map();
    let return1 =  result === undefined ?  [] : result;
    return return1;
};

function symbolicSub(expr, variable, value) {
    let re = new RegExp('[^A-z]'+variable+'[^A-z]','g');
    let modifyied = (' ' + expr + ' ').replace(re, ' ' + value + ' ');
    if (Array.isArray(dict.get(variable) )) {
        modifyied = (' ' + expr + ' ').replace(re, ' ' + JSON.stringify(value) + ' ');
    }
    return modifyied.substring(1,modifyied.length-1);

}

function symbolicSubAll(value) {
    let result = value;
    for ( const k of dict.keys() ){
        result = symbolicSub(result,k,dict.get(k));
    }
    return result;
}

export {parseCode};

