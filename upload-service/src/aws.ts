import AWS from "aws-sdk";
import fs from "fs";

const s3 = new AWS.S3({
    accessKeyId: ,
    secretAccessKey: 
})


export const uploadFile = async (fileName: string, localFilePath: string)=>{
    console.log("called");
    
    const fileContent = fs.readFileSync(localFilePath);
    
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "namanvercelbucket",
        Key: fileName,
    }).promise();
    // console.log(response);
}


