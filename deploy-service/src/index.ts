import {createClient} from "redis";
import { copyFinalDist, downloadS3Folder } from "./aws.js";
import { buildProject } from "./builderfn.js";



const subscriber = createClient();
subscriber.connect();



const publisher = createClient();
publisher.connect();

async function main(){
    while(1){
        const response = await subscriber.brPop('build-queue',0);

        const id = response!.element
        console.log(id)

        await downloadS3Folder(`output/${id}`);
        await buildProject(id);
        await copyFinalDist(id);

        publisher.hSet("status", id, "deployed")

        console.log(response)
    }
}
main();