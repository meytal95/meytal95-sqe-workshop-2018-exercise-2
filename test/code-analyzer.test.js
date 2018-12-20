import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';
import {getLines} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('','')),
            '""'
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;','')),
            '"let a = 1;"'
        );
    });

    it('is parsing a binary variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1+3;','')),
            '"let a = 1 + 3;"'
        );
    });

    it('is handling empty params function', () => {
        assert.equal(
            JSON.stringify(parseCode('function p () {return 3;}','')),
            '"function p() {\\n' +
            '    return 3;\\n' +
            '}"'
        );
    });

    it('is handling params function', () => {
        assert.equal(
            JSON.stringify(parseCode('function p (x) {return x+2;}','2')),
            '"function p(x) {\\n' +
            '    return x + 2;\\n' +
            '}"'
        );
    });

    it('is handling function with bound var', () => {
        assert.equal(
            JSON.stringify(parseCode('function p (x) {let z=x+2; return z;}','2')),
            '"function p(x) {\\n' +
            '    return x + 2;\\n' +
            '}"'
        );
    });

    it('is handling function with bound var assignment', () => {
        assert.equal(
            JSON.stringify(parseCode('function p (x) {let z=x+2; x=z+3; return x;}','2')),
            '"function p(x) {\\n' +
            '    x = x + 2 + 3;\\n' +
            '    return x;\\n' +
            '}"'
        );
    });

    it('is handling function with bound var assignments', () => {
        assert.equal(
            JSON.stringify(parseCode('function p (x,y) {let z=x,c=y; c=z; return c;}','1,2')),
            '"function p(x, y) {\\n' +
            '    return x;\\n' +
            '}"'
        );
    });

    it('is handling function with bound binary var assignments', () => {
        assert.equal(
            JSON.stringify(parseCode('function p (x,y) {let z=x+1; let c=z*y; z=c+(2*81); return z;}','1,2')),
            '"function p(x, y) {\\n' +
            '    return (x + 1) * y + 2 * 81;\\n' +
            '}"'
        );
    });

    it('is handling function with 2 bound var assignment', () => {
        assert.equal(
            JSON.stringify(parseCode('function p (x) {let z=x; let y=z; return y;}','2')),
            '"function p(x) {\\n' +
            '    return x;\\n' +
            '}"'
        );
    });

    it('is handling function with while', () => {
        assert.equal(
            JSON.stringify(parseCode('function p (x) {while (x<1) {let z=1; x=z;}}','2')),
            '"function p(x) {\\n' +
            '    while (x < 1) {\\n' +
            '        x = 1;\\n' +
            '    }\\n' +
            '}"'
        );
    });

    it('is handling function with one if', () => {
        assert.equal(
            JSON.stringify(parseCode('function p (x) {if (x==3) {return x;}}','2')),
            '"function p(x) {\\n' +
            '    if (x == 3) {\\n' +
            '        return x;\\n' +
            '    }\\n' +
            '}"'
        );
    });

    it('is handling function with one if else', () => {
        assert.equal(
            JSON.stringify(parseCode('function p (x) {x=true; if (x) {return x;} else {return 0;}}','true')),
            '"function p(x) {\\n' +
            '    x = true;\\n' +
            '    if (x) {\\n' +
            '        return x;\\n' +
            '    } else {\\n' +
            '        return 0;\\n' +
            '    }\\n' +
            '}"'
        );
    });

    it('is handling function with two if else', () => {
        assert.equal(
            JSON.stringify(parseCode('function p (x) {let z=true; if (z) {z=x; if (z) {return x;} else {return 0}} else {return 0;}}','true')),
            '"function p(x) {\\n' +
            '    if (true) {\\n' +
            '        if (x) {\\n' +
            '            return x;\\n' +
            '        } else {\\n' +
            '            return 0;\\n' +
            '        }\\n' +
            '    } else {\\n' +
            '        return 0;\\n' +
            '    }\\n' +
            '}"'
        );
    });

    it('is handling function with binary in test', () => {
        assert.equal(
            JSON.stringify(parseCode('function g(x) {let z=x+1;if(2*z<2)return x;}','2')),
            '"function g(x) {\\n' +
            '    if (2 * (x + 1) < 2)\\n' +
            '        return x;\\n' +
            '}"'
        );
    });


    it('is handling function with arrays 1', () => {
        assert.equal(
            JSON.stringify(parseCode('function g(x) {let z=[1,x,3];z=[1,2,3];if(z[1]<2)return x;}','2')),
            '"function g(x) {\\n' +
            '    if (2 < 2)\\n' +
            '        return x;\\n' +
            '}"'
        );
    });

    it('is handling function with arrays 2', () => {
        assert.equal(
            JSON.stringify(parseCode('function g(x) {let z=[1,x,3]; let y; y=z; if(y[1]<2) return x;}','2')),
            '"function g(x) {\\n' +
            '    if (x < 2)\\n' +
            '        return x;\\n' +
            '}"'
        );
    });

    it('is listing ifs', () => {
        parseCode('function p (x) {let z=x; if (z<2) {return z;} else if (z>5) {return z+2;} else if (z==3) {return 2;} else {return 9;}} ','3');
        assert.equal(
            JSON.stringify(getLines()),
            '[2]'
        );
    });


});
