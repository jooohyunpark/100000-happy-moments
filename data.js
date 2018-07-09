/* set up XMLHttpRequest */
var url = "test.csv";
var oReq = new XMLHttpRequest();
oReq.open("GET", url, true);
oReq.responseType = "arraybuffer";


oReq.onload = function (e) {
    var arraybuffer = oReq.response;

    /* convert data to binary string */
    var data = new Uint8Array(arraybuffer);
    var arr = new Array();
    for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
    var bstr = arr.join("");

    /* Call XLSX */
    var workbook = XLSX.read(bstr, {
        type: "binary"
    });

    /* DO SOMETHING WITH workbook HERE */
    var first_sheet_name = workbook.SheetNames[0];

    /* Get worksheet */
    var worksheet = workbook.Sheets[first_sheet_name];
    var data = XLSX.utils.sheet_to_json(worksheet, {
        raw: true
    })
    var randomVal = Math.floor(Math.random() * data.length);
    var finalResult = data[randomVal].data;
    //  console.log( );

    document.getElementById("text").innerHTML = finalResult;

    if (finalResult.length > 500) {
        document.getElementById("text").style.fontSize = '20px';
    }



    document.getElementsByClassName("text-wrapper")[0].addEventListener("click", function () {
        var randomVal2 = Math.floor(Math.random() * data.length);
        var finalResult2 = data[randomVal2].data;
        document.getElementById("text").innerHTML = data[randomVal2].data;

        if (finalResult2.length > 500) {
            document.getElementById("text").style.fontSize = '24px';
        }
        
//    document.getElementById("text").style.color = '#' + Math.floor(Math.random()*16777215).toString(16);
        
    });

}

oReq.send();



function trigger() {
    var button = document.getElementById("info");
    var x = document.getElementById("infoContent");

    if (x.style.display == "block") {
        x.style.display = "none";
        button.style.backgroundColor = 'white';
    } else {
        x.style.display = "block";
        button.style.backgroundColor = 'black';
    }

}



//function mouseOver() {
//    document.getElementById("text").style.color = '#' + Math.floor(Math.random()*16777215).toString(16);
//}
//
//function mouseOut() {
//     document.getElementById("text").style.color ="black";
//}

//function mouseOver2() {
//    document.getElementById("info-wrapper").style.color = '#' + Math.floor(Math.random()*16777215).toString(16);
//        document.getElementById("info-wrapper").style.backgroundColor = '#' + Math.floor(Math.random()*16777215).toString(16);
//    document.getElementById("info").style.backgrounColor = '#' + Math.floor(Math.random()*16777215).toString(16);
//}
//
//function mouseOut2() {
//     document.getElementById("info-wrapper").style.color ="black";
//}




