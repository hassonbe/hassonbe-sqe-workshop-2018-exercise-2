import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('','')),
            '[]'
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;','')),
            JSON.stringify([])
        );
    });

    it('simple function with one return point', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo (x,y){let a = 1;\n let b = 2 ; \n let c = a +b ; c=c+a ; return c;}','')),
            '"function foo (x,y){    <br>return ((1 + 2) + 1);<br>}"'
        );
    });

    it('is parsing a simple function correctly with environment variables correct', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;\n let b = 2 ; \nfunction foo (x,y){ let c = a +b ; c=c+a ; return c;}','')),
            '"function foo (x,y){  <br>return ((1 + 2) + 1);<br>}"'
        );
    });

    it('parsing first example', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '}\n','')),
            '"function foo (x,y,z){   <p >if((((x + 1) + y) < z))</p> { <br>return (((x + y) + z) + (0 + 5));<br>}<p >else if((((x + 1) + y) < (z * 2)))</p> { <br>return (((x + y) + z) + ((0 + x) + 5));<br>}<br>else{  <br>return (((x + y) + z) + ((0 + z) + 5));<br>}<br>}"'

        );
    });

    it('parsing second example', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    while (a < z) {\n' +
                '        c = a + b;\n' +
                '        z = c * 2;\n' +
                '    }\n' +
                '    \n' +
                '    return z;\n' +
                '}','')),
            '"function foo (x,y,z){   <br>while(((x + 1) < z)){ <br>z = (((x + 1) + ((x + 1) + y)) * 2);<br>} <br>return z;<br>}"'

        );
    });

    it('third example no color', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '}\n','')),
            '"function foo (x,y,z){   <p >if((((x + 1) + y) < z))</p> { <br>return (((x + y) + z) + (0 + 5));<br>}<p >else if((((x + 1) + y) < (z * 2)))</p> { <br>return (((x + y) + z) + ((0 + x) + 5));<br>}<br>else{  <br>return (((x + y) + z) + ((0 + z) + 5));<br>}<br>}"'
        );
    });

    it('third example with color', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '}\n','1,2,3')),
            '"function foo (x,y,z){   <p style=\\"background-color:red;\\">if((((1 + 1) + 2) < 3))</p> { <br>return (((1 + 2) + 3) + (0 + 5));<br>}<p style=\\"background-color:green;\\">else if((((1 + 1) + 2) < (3 * 2)))</p> { <br>return (((1 + 2) + 3) + ((0 + 1) + 5));<br>}<br>else{  <br>return (((1 + 2) + 3) + ((0 + 3) + 5));<br>}<br>}"'
        );
    });
    it('parsing array expressions , and complex logical exps', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x,isEqual,arr){\n' +
                '    let a;\n' +
                '    a= x+7;\n' +
                '    if(isEqual || (arr[3]>2 && (!(7 >= a)))){\n' +
                '    return a;\n' +
                '}\n' +
                'return arr[3];\n' +
                '}\n','3,false,[1,2,3,4,5]')),
            '"function foo (x,isEqual,arr){  <p style=\\"background-color:green;\\">if((false || (([1,2,3,4,5][3] > 2) && !(7 >= (3 + 7)))))</p> {<br>return (3 + 7);<br>} <br>return [1,2,3,4,5][3];<br>}"'
        );
    });

    it('parsing unsupported expressions', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x,isEqual,arr){\n' +
                '    let a;\n' +
                '    a= arr[2];\n' +
                '     if(7 && 8){\n' +
                '    return a;\n' +
                '}\n' +
                'return a === true ? arr : [];\n' +
                '}\n','3,false,[1,2,3,4,5]')),
            '"function foo (x,isEqual,arr){  <p style=\\"background-color:red;\\">if((7 && 8))</p> {<br>return [1,2,3,4,5][2];<br>} <br>return Error: unrecognized expression: ConditionalExpression;<br>}"'

        );
    });
});
