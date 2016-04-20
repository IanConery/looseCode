window.onload = function () {
setTimeout(function(){
 numPages = Number(window.location.href.split("numPages=")[1]);
console.log(numPages);
  // document.body.style.top =5;

   document.body.style.height = numPages * 1105;
document.getElementById("container").style.height="100%"
   document.body.style.width = 800;

                doc = new jsPDF();


            function done(){
                fileLabel = localStorage.getItem("dg::fileName")
                filename = fileLabel+ '.pdf';
                doc.save(filename);
                 document.write("<div id='container' width=800>"+localStorage.getItem("dg::export")+localStorage.getItem("dg::export1")+localStorage.getItem("dg::export2")+"</div>")
            }

           html2canvas(document.getElementById("container")).then(function(canvas) {
                //document.body.appendChild(canvas);
                ctxx = canvas.getContext("2d");
                //ctxxx = new C2S()
                var imageData = canvas.toDataURL("image/jpeg",1.0);
                var image = new Image();
                image = Canvas2Image.convertToJPEG(canvas);
                //document.body.appendChild(image);

                //image.src=imageData;
                image.onload = function(){
                doc.addImage(imageData, 'JPEG', 10, 10);
                var croppingYPosition = 1095;
                //numPages = Number(localStorage.getItem("dg::numPages"));
                //image.width=800;
                //image.height = numPages * 1095;
                count = Math.ceil(image.height/1095) - 1;

               // console.log(numPages);
//                jQuery('.box').slice(1).hide()
              //  var value_of_divs = $.map($('.inside div'), function (div) {
                //     return div.style.zIndex;
                  //  });
      //  document.getElementById("container").style.marginop = "-1095";
                var count =0;
                function callback(){

                        doc.addPage();


                        var sourceX = 0;
                        var sourceY = croppingYPosition;
                        var sourceWidth = image.width;
                        var sourceHeight = 1095;
                        var destWidth = sourceWidth;
                        var destHeight = sourceHeight;
                        var destX = -10;
                        var destY = -10;
                        var canvas1 = document.createElement('canvas');
                        canvas1.setAttribute('height', destHeight);
                        canvas1.setAttribute('width', destWidth);
                        var ctx = canvas1.getContext("2d");
                        ctx.drawImage(image, sourceX,
                                             sourceY,
                                             sourceWidth,
                                             sourceHeight,
                                             destX,
                                             destY,
                                             destWidth,
                                             destHeight);

                        var image2 = new Image();

                         //var svg = ctx.getSvg();
                        //console.log(svg)
                   //     ctx.font = "20px Arial";
                   ///    ctx.fillText("Hello World",sourceWidth - 50,sourceY);
                        image2 = Canvas2Image.convertToJPEG(canvas1);
                        image2.setAttribute("id", "image"+count);
                       // $('#images').show()
                       // document.body.innerHTML += "<div id='showMe'>"
                        document.body.appendChild(image2);
                       // document.body.innerHTML += "</div>"



                       image2Data = image2.src;
                    image2.onload = function(){
                        doc.addImage(image2, 'JPEG', 10, 10);
                        croppingYPosition += destHeight;
                        count++;
                        var element = document.getElementById("image"+count);
                        console.log(element)
                      //  element.parentNode.removeChild(element);
                      //  $('#images').hide()
                       // console.log(numPages)
                        if (count<numPages - 1){
                            callback();
                        }  else {
                            done();
                        }
                    }

            }
            callback();
        }
            });
/*
var source = window.document.getElementsByTagName("body")[0];

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd
    }
    if(mm<10){
        mm='0'+mm
    }

    html2canvas(document.body).then(function(canvas) {
    document.body.appendChild(canvas);
    });
               html2canvas(document.body, {
                onrendered: function (canvas) {
                var imageData = canvas.toDataURL("image/jpeg");
                var image = new Image();
                image = Canvas2Image.convertToJPEG(canvas);
                var doc = new jsPDF();
                doc.addImage(imageData, 'JPEG', 12, 10);
                var croppingYPosition = 1095;
                count = (image.height) / 1095;

                for (var i =1; i < count; i++) {
                        doc.addPage();
                        var sourceX = 0;
                        var sourceY = croppingYPosition;
                        var sourceWidth = image.width;
                        var sourceHeight = 1095;
                        var destWidth = sourceWidth;
                        var destHeight = sourceHeight;
                        var destX = 0;
                        var destY = 0;
                        var canvas1 = document.createElement('canvas');
                        canvas1.setAttribute('height', destHeight);
                        canvas1.setAttribute('width', destWidth);
                        var ctx = canvas1.getContext("2d");
                        ctx.drawImage(image, sourceX,
                                             sourceY,
                                             sourceWidth,
                                             sourceHeight,
                                             destX,
                                             destY,
                                             destWidth,
                                             destHeight);
                        var image2 = new Image();
                        image2 = Canvas2Image.convertToJPEG(canvas1);
                        image2Data = image2.src;
                        doc.addImage(image2Data, 'JPEG', 12, 10);
                        croppingYPosition += destHeight;
                    }
                var d = new Date().toISOString().slice(0, 19).replace(/-/g, "");
                filename = 'report_' + d + '.pdf';
                doc.save(filename);
            }

        });*/
},1000);
}