import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const s3 = new AWS.S3({
    accessKeyId: ,
    secretAccessKey: ,

})


export async function downloadS3Folder(prefix: string) {
    // console.log("called")
    const allFiles = await s3.listObjectsV2({
        Bucket: "namanvercelbucket",
        Prefix: prefix
    }).promise();

    
    
    const allPromises = allFiles.Contents?.map(async ({Key}) => {
        // console.log(".map running")
        return new Promise(async (resolve) => {
            if (!Key) {
                resolve("");
                console.log("no key")
                return;
            }
            const finalOutputPath = path.join(__dirname, Key);
            console.log(finalOutputPath);

            const outputFile = fs.createWriteStream(finalOutputPath);
            console.log(outputFile);

            const dirName = path.dirname(finalOutputPath);
            console.log(dirName)

            if (!fs.existsSync(dirName)){
                fs.mkdirSync(dirName, { recursive: true });
                // console.log("directory made")
            }
            s3.getObject({
                Bucket: "namanvercelbucket",
                Key
            }).createReadStream().pipe(outputFile).on("finish", () => {
                console.log("downloaded")
                resolve("");
                
            })
        })
    }) || []
    console.log("awaiting");

    await Promise.all(allPromises?.filter(x => x !== undefined));
}

export function copyFinalDist(id: string){
    const folderPath = path.join(__dirname, `output/${id}/dist`);
    const allFiles =  getAllFiles(folderPath);
    allFiles.forEach(file=>{
        uploadFile(`dist/${id}/` + file.slice(folderPath.length +1), file)
    })  
}

const getAllFiles = (folderPath: string) => { 

    let response: string[] = [];

    const allFilesAndFolders = fs.readdirSync(folderPath);
    allFilesAndFolders.forEach(file => {
        const fullFilePath = path.join(folderPath, file);
        if (fs.statSync(fullFilePath).isDirectory()) {
            response = response.concat(getAllFiles(fullFilePath))
        } else {
            response.push(fullFilePath.replace(/\\/g, "/"));
        }
    });
    return response;
}

const uploadFile = async (fileName: string, localFilePath: string)=>{
    console.log("called");
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "namanvercelbucket",
        Key: fileName,
    }).promise();
    console.log(response);
}