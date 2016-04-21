

           html2canvas(document.body).then(function(canvas) {
                ctxx = canvas.getContext("2d");
                //ctxxx = new C2S()
                var imageData = canvas.toDataURL("image/jpeg",1.0);
           //     ctx.font = "12px Arial";
              //  ctx.strokeText("Hello World",1080,image.width - 50);
                var image = new Image();
                image = Canvas2Image.convertToJPEG(canvas);
                var doc = new jsPDF();
                doc.addImage(imageData, 'JPEG', 10, 10);
               // console.log(image.width);
             //   var body = document.body,
  //  html = document.documentElement;

//var height = Math.max( body.scrollHeight, body.offsetHeight,
  //                     html.clientHeight, html.scrollHeight, html.offsetHeight );
//console.log(height)
                var croppingYPosition = 1095;
                count = Math.ceil(image.height/1095) - 1;



                for (var i =1; i < 4; i++) {
                        doc.addPage();
                        var sourceX = 0;
                        var sourceY = croppingYPosition;
                        var sourceWidth = 800;
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
                        ctx.font = "20px Arial"
                        ctx.fillText(i+1,780,1040);
                        image2 = Canvas2Image.convertToJPEG(canvas1);
                        image2Data = image2.src;
                        doc.addImage(image2Data, 'JPEG', 10, 10);
                        croppingYPosition += destHeight;
                    }
                fileLabel = localStorage.getItem("dg::fileName")
                filename = fileLabel+ '.pdf';
                doc.save(filename);
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