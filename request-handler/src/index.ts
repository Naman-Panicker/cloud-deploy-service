import express from "express";
import AWS from "aws-sdk"


const s3 = new AWS.S3({
    accessKeyId: ,
    secretAccessKey: 
})


const app = express();

app.get("/{*splat}", async (req,res)=>{

    console.log("route hit")

    const host = req.hostname;
    console.log(host);
    const id = host.split(".")[0];
    console.log(id);     

    const filePath = req.path;  

    console.log(filePath);

    const contents = await s3.getObject({
        Bucket: "namanvercelbucket",
        Key: `dist/${id}${filePath}`
    }).promise()


    const type = filePath.endsWith("html") ? "text/html" : filePath.endsWith("css") ? 
    "text/css" : "application/javascript"    
    res.set("Content-type", type);

    res.send(contents.Body)         

})

app.listen(3001)
