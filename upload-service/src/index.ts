import express from "express";
import cors from "cors";
import {simpleGit} from "simple-git";
import { generate } from "./generate.js";
import path from "path";
import { getAllFiles } from "./file.js";
import { fileURLToPath } from "url";
import { uploadFile } from "./aws.js";
import {createClient} from "redis";

const publisher =  createClient();
publisher.connect();

const subscriber = createClient();
subscriber.connect();



const app = express();

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.post("/deploy", async (req,res)=>{

    const repoUrl= req.body.repoUrl;
    const id = generate();
    await simpleGit().clone(repoUrl, path.join(__dirname,`output/${id}`))

    const files = getAllFiles(path.join(__dirname, `output/${id}`))


    files.forEach(async file=>{
        
        await uploadFile(file.slice(__dirname.length+1), file)
    })

    publisher.lPush("build-queue",id);
    publisher.hSet("status", id, "uploaded");


    app.get('/status', async (req,res)=>{
        const id = req.query.id;
        const response = await subscriber.hGet("status", id as string);
        res.json({
            status: response
        })
    })
     
    
    res.json({
        id: id
    })
})

app.listen(3000);