if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined'
        ? args[number]
        : match
        ;
        });
  };
}

// ajax prepare in jQuery
$.ajaxPrefilter(function (options) {
    if (options.crossDomain && jQuery.support.cors) {
        // check the protocol which the browser is using
        var http = (window.location.protocol === 'http:' ? 'http:' : 'https:');

        // make CORS-available url and setup the option
        options.url = http + '//cors-anywhere.herokuapp.com/' + options.url;

        // old version:
        // options.url = "http://cors.corsproxy.io/url=" + options.url;
    }
});

$.fn.maphilight.defaults.alwaysOn = true;

function ajaxRequest(url, callback) {
    // use get to query the url
    $.get(url, callback);
}

function inRangeCheck(bookid, selectedShelf) {
    var idPrefix   = parseInt(bookid.split(' ')[0]);
    var shelfFront = parseInt(selectedShelf["idfro"].split(' ')[0]);
    var shelfBack  = parseInt(selectedShelf["idbac"].split(' ')[0]);

    if (idPrefix >= shelfFront && idPrefix <= shelfBack) return 0;
    else if (idPrefix < shelfFront) return -1;
    else if (idPrefix > shelfBack ) return 1;
    else return null;
}

function siblingCheck(bookid, selectedShelf, front) {
    var idPrefix    = parseInt(bookid.split(' ')[0]);
    var shelfFront  = parseInt(selectedShelf["idfro"].split(' ')[0]);
    var shelfBack   = parseInt(selectedShelf["idbac"].split(' ')[0]);
    var idPrefixN   = bookid.split(' ')[1].split('-')[0];
    var shelfFrontN = selectedShelf["idfro"].split(' ')[1];
    var shelfBackN  = selectedShelf["idbac"].split(' ')[1];

    if (typeof idPrefixN === "undefined") return false;
    if (idPrefix === shelfFront && front) {
        if (idPrefixN - shelfFrontN < 0) return true;
    } else if (idPrefix === shelfBack && front) {
        if (idPrefixN - shelfBackN > 0) return true;
    } else return false;
}

function modalAlert(message) {
    $('#my-alert .am-modal-bd').text(message);
    $('#my-alert').modal();
}

function modalPopup(targetbook) {
    var sits      = ['右', '左', '中'];
    var bookshelf = Math.ceil(targetbook.arr / 2);
    var bookside  = targetbook.arr % 2 === 1 ? '靠近電梯的那一面' : '遠離電梯的那一面';
    var imglist   = [2, null, 3, 4, 4];
    var coorlist  = [cimg2, null, cimg3, cimg4, cimg4];
    $('#my-popup .am-popup-bd').html(
        '<p>' +
            '請搭乘電梯至' + targetbook.F + '樓<br />' + 
            '從電梯出發後，沿著' + sits[targetbook.sit] + '側書櫃數到第' + bookshelf + '個書櫃<br />' +
            '從' + bookside + '開始找起' +
        '</p>' +
        '<img id="map" src="assets/images/image'+ imglist[targetbook.F - 3] +'.png" usemap="#coorMap" />' +
        '<map name="coorMap" id="coorMap">' +
            '<area id="targetPos" alt="" href="#" coords="'+ coorlist[targetbook.F - 3][targetbook.sit][bookshelf - 1] +'" shape="rect" />' +
        '</map>'
    );
    $('#map').maphilight();
    $('#my-popup').modal();
}

function generateHistory(searchHis) {
    var len = Math.min(searchHis.length, 5);
    $('.searchHistory-container').html('');
    for(var i = len - 1; i >= 0; i -= 1) {
        $('.searchHistory-container').append(
            '<li>' +
                '<a>' +
                    searchHis[i] +
                '</a>' +
            '</li>'
        );
    }
    $('.searchHistory-container li').click(function (){
        $('#searbo').val($(this).text());
        $('#searchbook').click();
    });
}