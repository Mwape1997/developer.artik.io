fs=require("fs");var Upload=require("s3-uploader"),client=new Upload("artiktest1",{aws:{path:"",region:"us-west-2",acl:"public-read",output:"json"},cleanup:{versions:!1,original:!1},original:{awsImageAcl:"private"},versions:[{maxHeight:1040,maxWidth:1040,format:"jpg",suffix:"-large",quality:80,awsImageExpires:31536e3,awsImageMaxAge:31536e3}]});client.upload("/root/img_trashcan.jpg",{},function(e,a,i){if(e)throw e;a.forEach(function(e){console.log(e.width,e.height,e.url);var a=e.url.split("/");fs.writeFile("output",a[4].replace("'","").split(".")[0],function(e){return e?console.log(e):void 0})})});