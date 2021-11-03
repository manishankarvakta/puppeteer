// imports
import express from 'express';
import path from 'path';

// puppeteer imports
import puppeteer from "puppeteer";
import dotenv from "dotenv";
import fs from "fs";
import deathbycaptcha from "deathbycaptcha2";

// death by captcha credentials
  deathbycaptcha.credentials = {
    // username: 'po0lash',
    // password: 'Polash1234'
    username: 'hasan22149',
    password: '424212Yy'
  };

// dealy function
function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }


// genetrate slip id
function genrateSlipId(slipID, driction, amount){
    // const date = Date.now();
    const lists = [];
    const start = slipID.substring(0,9);
    const base = parseInt(slipID.substring(9));
  
  
    if(driction == "ASC"){
        for (let i = 0; i < amount; i++) {
            lists.push(`${start}${base+i}`); 
          }
    }else{
        for (let i = 0; i < amount; i++) {
            lists.push(`${start}${base-i}`); 
          }
    }
    return lists;
  }
  
// scraping functions
async function run() {
    // slip id array
dotenv.config();
const slipLists =  genrateSlipId('92410202128486454', 'ASC', '10');
// console.log(chunk(slipLists));
const slipChunk = chunk(slipLists);

  // console.log(`${slipId}`);
  for (let i = 0; i < slipChunk.length; i++) {
    
  
        try {
            const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,      
            args: ['--start-maximized'] 
            });
            console.log(`New Thread Open: Browser ${i+1}`);
            
            slipChunk[i].map(async  (slipId) => {
              const url = "https://v2.gcchmc.org/medical-status-search/";
              // new page
              const page = await browser.newPage();
              console.log(`New Tab Open: Browser ${i+1} >> ${slipId} `);
                // open search page
                await page.goto(url);

                // go to search by slip id
                await page.click("#id_search_variant_1");
                console.log(`Select By GCC slip number`);
                // process.exit()

                // enter slip id
                await page.type("#id_gcc_slip_no", slipId);
                console.log(`Type slip number: ${slipId}`);

                // submit function
                async function submitFrom(){
                // TODO
                // add captcha solver deathbycaptcha2         
                console.log(`Wait for Solve chaptcha | slip: ${slipId}`);
                await page.waitForSelector('.captcha');
                // Select the .captcha img element and save the screenshot.
                const svgImage = await page.$('.captcha');
                const box = await svgImage.boundingBox();
                const captchaUrl =`captcha/${slipId}-${Date.now()}.png`;
                                    // this method returns an array of geometric parameters of the element in pixels.
                const x = box['x'];                                // coordinate x
                const y = box['y'];                                // coordinate y
                const w = box['width'];                            // area width
                const h = box['height']; 
                await delay(5000).then(async () => {
                    await page.screenshot({'path': `${captchaUrl}`, 'clip': {'x': x+10, 'y': y, 'width': w, 'height': h}, omitBackground: true}); 
                });   

                console.log(`Captcha URL: ${captchaUrl}  | slip: ${slipId}`);
                if(captchaUrl){
                    // get captcha code
                    deathbycaptcha.decodeFile(captchaUrl, 10000, async function(err, result) {

                    // console.log(`Captcha Found: ${result.text}`);
                    // get captch 
                    const cText = result.text;
                    console.log( `Captcha found: ${cText}  | slip: ${slipId}`);
                    if(cText){
                        // replace captcha
                        await page.type("#id_captcha_1", cText);
                        console.log(`Type Chaptcha: ${cText} | slip: ${slipId}`);

                        // submit
                        await page.click("#med-status-form-submit");
                        console.log(`Submit for slip number: ${slipId}`);


                        // captcha wrror
                        try {
                        await delay(2000).then(async () => {
                            // await page.screenshot({'path': `${captchaUrl}`, 'clip': {'x': x, 'y': y, 'width': w, 'height': h}, omitBackground: true}); 
                            let capErre = (await page.$(`body > main > div > div.ui.vertical.basic.segment.medical-status-search > div > div > div > form > div.form-fields-container > div:nth-child(5) > div > div > div.field-error-message`)) ? await page.$eval(`body > main > div > div.ui.vertical.basic.segment.medical-status-search > div > div > div > form > div.form-fields-container > div:nth-child(5) > div > div > div.field-error-message`, el => el.textContent) : '';
                            // await page.$(`body > main > div > div.ui.vertical.basic.segment.medical-status-search > div > div > div > form > div.form-fields-container > div:nth-child(5) > div > div > div.field-error-message`);
                            // console.log(capErre)
                            // console.log(capErre.length)
                            if(capErre.length>0){
                            console.log(`captcha Code: ${cText} error ID: ${slipId}`);
                            await deleteCap(captchaUrl);
                            // captcha no wrror
                            // restart the search
                            submitFrom();
                            }else{
                            console.log(`Captcha Code: ${cText} Works`)
                            // slip payment found
                            try{
                                await delay(2000).then(async () =>{
                                await page.waitForSelector('body > div.ui.dimmer.modals.page.transition.visible.active > div > div.content > div > div > div > div.six.wide.column.medical_center_info > table > tbody > tr:nth-child(2) > td.field_value');
                                const madical =  await page.$eval("body > div.ui.dimmer.modals.page.transition.visible.active > div > div.content > div > div > div > div.six.wide.column.medical_center_info > table > tbody > tr:nth-child(2) > td.field_value", el => el.textContent);
                                if(madical){
                                    // slip payment found
                                    console.log(`Payment Found for Slip: ${slipId}, Medical Center: ${madical}`);  
                                    fs.appendFileSync("slipList.txt", `Payment Found for Slip: ${slipId} | ${madical} |\n`); 
                                    console.log(`Saved to File Successful! | slip: ${slipId}`);  
                                    await page.close()   
                                // await browser.close();                
                                }else{
                                    // payment is not found
                                    console.log(`Payment not Found for Slip: ${slipId}`); 
                                    await deleteCap(captchaUrl);
                                    await page.close()
                                    // await browser.close(); 
                                }
                                });
                            }catch{
                                console.log(`Payment not Found for Slip: ${slipId}`);  
                                await deleteCap(captchaUrl);
                                await page.close()
                                // await browser.close();
                            }

                            }
                        }); 
                            
                            
                        
                            
                        // ...
                        } catch (error) {
                        console.log("No captcha error");
                        await deleteCap(captchaUrl);
                        }
                    

                    }
                });
                }

                }

                submitFrom();
            });
            // await browser.close();

        } catch (error) {
            console.log(error);  
            await deleteCap(captchaUrl);            
        }finally {
          // console.log(`Thread Operation Done: Browser ${i}`);

          // await browser.close();
        }
    }
}



// const
const app = express();
const port = '3000';
const __dirname = path.resolve();





// statics files
app.use(express.static('public'));
app.use('/css', express.static(__dirname+'public/css'));
app.use('/js', express.static(__dirname+'public/js'));
app.use('/img', express.static(__dirname+'public/img'));
app.use(express.urlencoded({extended:true}))

// set viwes
app.set('viwes', './viwes');
app.set('view engine', 'ejs');


// Home page
app.get('/', (req,res)=>{
  res.render('home');
})


// Home page
app.post('/', (req,res)=>{
  res.render('home',{slipId: req.body.currentSlip, order: req.body.order, num: req.body.num});
})

// listien port 3000
app.listen(port, ()=>{
  console.log(`App is live at : http://localhost:3000 `)
})


