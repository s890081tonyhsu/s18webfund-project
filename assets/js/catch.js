'use strict';
var bookdata   = [];
var bookdata2  = [];
var pagelink   = [];
var parsed1    = null;
var targetbook = null;
var searchHis  = [];

//  author
//  public
//  where
//  title
//  ID
//  status
/* global ajaxRequest, generateHistory */
$(document).ready(function() {

    searchHis = JSON.parse(sessionStorage.getItem('searchHistory') || '[]');
    generateHistory(searchHis);
    $('#searchbook').click(function(){
        if(searchHis.indexOf($('#searbo').val()) !== -1) {
            searchHis.splice(searchHis.indexOf($('#searbo').val()), 1);
        }
        searchHis.push($('#searbo').val());
        sessionStorage.setItem('searchHistory', JSON.stringify(searchHis));
        // sessionStorage.setItem('searc',$('#searbo').val());
        bookdata = [];
        bookdata2 = [];
        pagelink =[];
        parsed1=null;
    
        $.AMUI.progress.start();
        if($('#searbo').val() !== null){
            generateHistory(searchHis);
            // $('#searbo').val(sessionStorage.getItem('searc'));
            bookdata  = [];
            bookdata2 = [];
            pagelink  = [];
            // if(sessionStorage.getItem('searc')!=null){}
            // if($('#searbo').val()!=''){sessionStorage.setItem('searc',$('#searbo').val());}
            var query = $('#searbo').val(); 
            var url   = 'http://library.lib.fju.edu.tw/search*cht/Y?SEARCH={0}&SORT=D'.format(query);

            ajaxRequest(url,
                function (response) {
                    // after qurey, show the respose on page
                    var res = response;

                    var parsedm = $.parseHTML(res);
                    parsed1 = parsedm;
                    $(parsed1).find("a[href^='/search']")
                    .each(function() {
                        this.href = "http://library.lib.fju.edu.tw" + 
                                    this.pathname + this.search + this.hash;
                    }); 

                    var oneth = $(parsedm).find(".browsePager").html().trim();
                    oneth = oneth.split('"');
                     
                    oneth.forEach(function (item) {
                        if(item.indexOf('search') !== -1){
                            pagelink.push({ page: item });
                        }
                    });
                    catchall();

                    $("div.bookdata-container").html("");
                    bookdata.forEach(function (item) {
                        $("div.bookdata-container").append(
                            '<section class="am-panel am-panel-secondary">' +
                                '<header class="am-panel-hd">' +
                                    '<h3 class="am-panel-title">' +
                                        '<a href="' + item.url + '">' +
                                            item.title +
                                        '</a>' +
                                    '</h3>' +
                                '</header>' +
                                '<div class="am-panel-bd">' +
                                    '<div class="am-list-item-text" style="font-size:16px">' +
                                        item.author +
                                    '</div>' +
                                    '<div class="am-list-item-text" style="font-size:16px">' +
                                        item.public +
                                    '</div>' +
                                    '<div class="am-list-item-text" style="font-size:16px">' +
                                        item.where +
                                    '</div>' +
                                '</div>' +
                            '</section>');
                    });

                $('.am-panel-title > a').click(function(event){
                    event.preventDefault();
                    targetbook = null;
                    catchone($(this));
                });
                $.AMUI.progress.done();
            });
        }
    });
});

function catchall() {
    //change address
    $(parsed1).find("td[width='55%'][align='left']")
        .each(function(){  
            var url   = $(this).find('a').attr('href');
            var oneth = $(this).text().trim();
            oneth = oneth.split('\n');
            // console.log(oneth);
            bookdata.push({
                title:  oneth[0],
                author: oneth[2],
                public: oneth[4],
                where:  (oneth.length == 10? oneth[9] : oneth[10]),
                url:    url
            });
        });

    bookdata.forEach(function (item) {
        var url = item.url;

        ajaxRequest(url,
          function (response) {
              // after qurey, show the respose on page
              var res = response;

              // TODO: Filter the infomation we need by jQuery
              var parsed = $.parseHTML(res);

              var oneth = $(parsed).find(".bibItemsEntry").text().trim();
              var iSBN = [];
             
              $($(parsed).find(".bibInfoData").get().reverse())
                .each(function () {
                    var isbn = $(this).text().trim();
                    if(isbn[2]-'0' >= 0 && isbn[2] - '0'<=9 && isbn[0]-'0'>= 0&&isbn[0] - '0'<= 9){
                        iSBN.push($(this).text().trim());
                    }
                });
                oneth = oneth.split('\n');
             
                // console.log(oneth);
                var t2 = $($(parsed).find(".bibInfoData")[0]).text().trim();
                var t3 = $($(parsed).find(".bibInfoData")[1]).text().trim();
                bookdata2.push({
                    index:  (oneth[2] || "").trim(),
                    status: (oneth[4] || "").trim(),
                    ISBN:   iSBN,
                    title2: t2,
                    title3: t3
                });
        });
    });
}


function catchone(thisbook){
    //get one book's data
    var name  = thisbook.text();
    var found = bookdata2.find(function (item) {
        var tt2 = item.title2.toString();
        var tt3 = item.title3.toString();

        if (tt2.indexOf(name) !== -1 || tt3.indexOf(name) !== -1)
            return true;
        return false;
    });

    searchID(found);
}

// https://getbootstrap.com/docs/4.1/components/badge/#links
// preventdefault
// react chrome
/* global bnCH, bnEN */
/* global inRangeCheck, siblingCheck, modalAlert, modalPopup */
function searchID(id){
    // console.log(id);
    if (typeof id === "undefined" || id.index === "") {
        modalAlert('此為電子書,請至櫃台借閱');
        return;
    } else {
        // console.log(typeof id.index);
        id = id.index;
        // modalAlert(id);
    }

    var testparts = (id.split(' ')[1][0] - '0'>= 0 && id.split(' ')[1][0] - '0'<= 9 ? bnCH : bnEN) || bnCH;
    var mid = testparts.length / 2,
        fro = 0,
        bac = testparts.length - 1;
    var i = 1;
  
    while(fro <= bac && i < 1000){
        mid = Math.floor(mid);
        i   = i + 1;
   
        if (inRangeCheck(id, testparts[mid]) === 0) {
            if (siblingCheck(id, testparts[mid], true)) {
                mid--;
            } else if (siblingCheck(id, testparts[mid], false)){
                mid++;
            }

            targetbook = testparts[mid];
            // modalAlert("at " + testparts[mid]["idfro"] + " ~ " + testparts[mid]["idbac"]); 
            //code here to jump
            modalPopup(targetbook);
            return;
            //
        } else if (inRangeCheck(id, testparts[mid]) === -1) {
            bac = mid;
            mid = (bac + fro) / 2;
        } else if (inRangeCheck(id, testparts[mid]) === 1) {
            fro = mid;
            mid = (bac + fro) / 2;
        } else {
            modalAlert("ERROR");
            return;
        }
  }
  modalAlert("很抱歉，濟時樓以外的找不到");
}

//object  merge
//unionBy