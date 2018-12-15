import $ from 'jquery';
import {parseCode} from './code-analyzer';


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let params = $('#paramsPlaceHolder').val();
        let parsedCode = parseCode(codeToParse,params);
        $('#parsedCode').find('tbody').append('<tr><td>'+parsedCode+'</td></tr>');
    });
});
