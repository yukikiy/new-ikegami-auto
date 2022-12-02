const functions = require("firebase-functions");
// const admin = require('firebase-admin');

const axios = require('axios');
const qs = require('querystring');
const BASE_URL = 'https://notify-api.line.me';
const PATH =  '/api/notify';
const LINE_TOKEN = `OkRqCovYsQV6L5ch5AkBQAS6qRKNCKWiIqshqLkGes8`;

const puppeteer = require('puppeteer'); 

const runtimeOpts = {
    memory: '1GB',
    timeoutSeconds: 300,
}

exports.runFunction = functions
.runWith(runtimeOpts)
.pubsub.schedule("0-59/15 0,6,7,8,9,15,16,19,21,22,23 * * *")
.timeZone("Asia/Tokyo")
.onRun(async(context) => {

    async function getInfo() {
        const browser = await puppeteer.launch({
            headless: true,
        });
        const page = await browser.newPage();
        //waitForNavigationが一番最後にくる必要あり
        await page.goto('https://www.e-license.jp/el31/mSg1DWxRvAI-brGQYS-1OA%3D%3D');
        await page.type("#studentId", "21543");
        await page.type("#password", "kisaku0213");
        await page.click("#login");
        await page.waitForNavigation({waitUntil: 'load'});
        // await page.click(".nextWeek");
        // await page.waitForNavigation({waitUntil: 'load'});
        // await page.click(".nextWeek");
        // await page.waitForNavigation({waitUntil: 'load'});
        // await page.click(".nextWeek");
        // await page.waitForNavigation({waitUntil: 'load'});
        
        //using global scope 
        const dateBox = [];
        const weekBox  = [];
        const timeBox = [];
        messageBox = [];
    
        try {
            const rows = await page.$$('.simei');
    
                for (let i=0; i<5; i++){
                    const row = rows[i];
                    
                        const date = await row.evaluate(el => el.getAttribute('data-date'), row);
                        dateBox.push(date);
                        
                        const week= await row.evaluate(el => el.getAttribute('data-week'), row);
                        weekBox.push(week);
                        
                        const time = await row.evaluate(el => el.getAttribute('data-time'), row);
                        timeBox.push(time);
                }
    
                for (let i=0; i<dateBox.length; i++){
                    messageBox.push("\n" + dateBox[i] + weekBox[i] + timeBox[i]);
                }
    
    
            await browser.close();
        }catch(err){
            // console.log("messgeBox is empty");
            await browser.close();
        }
        
    };
    
    
    async function sendLine (){
    
        let config = {
            baseURL: BASE_URL,
            url: PATH,
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${LINE_TOKEN}`
            },
            data: qs.stringify({
                message: `以下の教習が空きましたhttps://www.e-license.jp/el31/mSg1DWxRvAI-brGQYS-1OA%3D%3D${messageBox}`,
            })
        };
        
        axios.request(config)
        .then((res) => {
            console.log(res.status);
        })
        .catch((error) => {
            console.log(error);
        });
    }

    async function finish(){
        return;
    };

    async function init(){
        await getInfo();
    
        if (messageBox.length === 0){
            await finish();
        }else{
            await sendLine();
        }
    };
    
    await init();
});

