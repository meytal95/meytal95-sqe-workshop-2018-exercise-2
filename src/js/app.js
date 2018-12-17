import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {getLines} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let paramsToParse=$('#paramPlaceholder').val();
        let parsedCode = parseCode(codeToParse,paramsToParse);
        let lines=getLines();
        let final = paint(parsedCode,lines);
        $('#parsedCode').empty();
        $('#parsedCode').append(final);
    });
});

function paint(code,lines) {
    let slines = code.split('\n');
    let i=0,res='';
    slines.forEach(l=>{
        l=l.replace('    ','&nbsp;&nbsp;&nbsp;&nbsp;');
        if (l.includes('if ')) {
            res+= ($.inArray( i, lines )>=0) ? '<p style = "background-color: greenyellow" >'+l+'</p>' : '<p style = "background-color: orangered" >'+l+'</p>';
            i++;
        }
        else
            res+='<p>'+l+'</p>';
    });
    return res;
}
