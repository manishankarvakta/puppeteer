import puppeteer from "puppeteer";
import dotenv from "dotenv";
import fs from "fs";
// import DeathByCaptcha from "deathbycaptcha";
// var dbc = new DeathByCaptcha(`${process.env.USER_ID}`, `${process.env.PASSWORD}`);

import deathbycaptcha from "deathbycaptcha2";

deathbycaptcha.credentials = {
  username: 'po0lash',
  password: 'Polash1234'
};

// import express from 'express'
// import bodyParser from 'body-parser'

// const app = express()

// app.listen(process.env.PORT || 5000)

// const slipList = ['90710202128213716', '90710202128213717', '90710202128213718'];
const slipList = ['91810202128391514'];



async function run(slipId) {
  dotenv.config();
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });


    const url = "https://v2.gcchmc.org/medical-status-search/";

          const page = await browser.newPage();
          // open search page
          await page.goto(url);
          // go to search by slip id
          await page.click("#id_search_variant_1");
          console.log(`Select By GCC slip number`);
        
        // loop through slip
          // const slipId = '90710202128213716';
          console.log(`Select for GCC slip number: ${slipId}`);
          
          // enter slip id
          await page.type("#id_gcc_slip_no", slipId);
          console.log(`Type slip number: ${slipId}`);
          
          //### chaptch options
          // var stream = fs.createWriteStream("slipList.txt");
         
          
          // captcha screenshot
          // async function getCaptchaUrl(svg){
            //  const captchaUrl =`captcha/${slipId}-${Date.now()}.png`;
            //  const box = await svg.boundingBox();              // this method returns an array of geometric parameters of the element in pixels.
            //  const x = box['x'];                                // coordinate x
            //  const y = box['y'];                                // coordinate y
            //  const w = box['width'];                            // area width
            //  const h = box['height'];                           // area height
            //  await page.screenshot({'path': `${captchaUrl}`, 'clip': {'x': x, 'y': y, 'width': w, 'height': h}, omitBackground: true});     //
            
            // console.log(`Captcha URL: ${captchaUrl}`);
          //   return captchaUrl;
          // }

          

          
          // TODO
          // add captcha solver deathbycaptcha2         
          console.log(`Wait for Solve chaptcha`);
          await page.waitForSelector('.captcha');
          // Select the .captcha img element and save the screenshot.
          const svgImage = await page.$('.captcha');
          const box = await svgImage.boundingBox();
          // console.log(svgImage);
          
          // get captcha image to text API
          async function submitFrom(){
             // save captcha as image            
            const captchaUrl =`captcha/${slipId}-${Date.now()}.png`;
                          // this method returns an array of geometric parameters of the element in pixels.
             const x = box['x'];                                // coordinate x
             const y = box['y'];                                // coordinate y
             const w = box['width'];                            // area width
             const h = box['height']; 
             await delay(10000).then(async () => {
                await page.screenshot({'path': `${captchaUrl}`, 'clip': {'x': x, 'y': y, 'width': w, 'height': h}, omitBackground: true}); 
             });   

            console.log(`Captcha URL: ${captchaUrl}`);
            try {
              deathbycaptcha.decodeFile(captchaUrl, 10000, async function(err, result) {
  
              //   console.log(`Captcha Found: ${result.text}`);
                // get captch 
                const cText = result.text;
                if(cText){
                  // replace captcha
                  await page.type("#id_captcha_1", cText);
                  console.log(`Type Chaptcha: ${cText}`);
                  
                  // submit
                  await page.click("#med-status-form-submit");
                  console.log(`Submit for slip number: ${slipId}`);
                  
                  
                  // get captcha error
                  let capErre = '';
                  capErre = (await page.$(`body > main > div > div.ui.vertical.basic.segment.medical-status-search > div > div > div > form > div.form-fields-container > div:nth-child(5) > div > div > div.field-error-message`)) ? await page.$eval(`body > main > div > div.ui.vertical.basic.segment.medical-status-search > div > div > div > form > div.form-fields-container > div:nth-child(5) > div > div > div.field-error-message`, el => el.textContent) : '';
                  // await page.$eval("body > div.ui.dimmer.modals.page.transition.visible.active > div > div.content > div > div > div > div.six.wide.column.medical_center_info > table > tbody > tr:nth-child(2) > td.field_value", el => el.textContent);
                  // check is chaptcha work
                  console.log(`Captcha Error !${capErre}`);
                  if (capErre && capErre.length  > 0) { // you had the condition reversed. Not sure if it was intended.
                    
                    console.log(`Captcha Error !`);
                      // console.log(`Captcha is not matched. ${cText} | captcha: ${captchaUrl}`);
                      console.log(`Waiting for new Captcha...`);
                       submitFrom();
                       console.log('True');
                      } else {
                        console.log('False');
                         // if success 
                          await page.waitForSelector('body > div.ui.dimmer.modals.page.transition.visible.active > div > div.content > div > div > div > div.six.wide.column.medical_center_info > table > tbody > tr:nth-child(2) > td.field_value');
                          const madical =  await page.$eval("body > div.ui.dimmer.modals.page.transition.visible.active > div > div.content > div > div > div > div.six.wide.column.medical_center_info > table > tbody > tr:nth-child(2) > td.field_value", el => el.textContent);
                          // await page.$('body > div.ui.dimmer.modals.page.transition.visible.active > div > div.content > div > div > div > div.six.wide.column.medical_center_info > table > tbody > tr:nth-child(2) > td.field_value');
                          if(madical){
                            console.log(`Payment Found for Slip: ${slipId}, Medical Center: ${madical}`);  
                            fs.appendFileSync("slipList.txt", `Payment Found for Slip: ${slipId} | ${madical} |\n`); 
                            console.log(`Saved to File Successful!`);  
                            
                            // stream.once('open', (fd) => {
                            //       stream.write(`Payment Found for Slip: ${slipId} | ${madical} |  ${Date().toISOString().slice(0, 10)}\n`);
                            //       stream.write("Second line\n");
                              
                            //       // Important to close the stream when you're ready
                            //       stream.end();
                            //   });
                            // fs.writeFileSync('slipList.txt', `Payment Found for Slip: ${slipId} | Medical Center: ${madical}  | Date & Time: ${madical}\n`);
                            await browser.close();                
                          }else{
                            console.log(`Payment not Found for Slip: ${slipId}`);  
                          }

                  }
                  
                  
                  
                }
             });
            } catch (error) {
              console.log(error);              
            }
          }
          

          function delay(ms) {
              return new Promise(r => setTimeout(r, ms));
          }
          // if(cUrl){
            submitFrom();
          // }
          
          // CHeck if found

          // if not found

          // console.log(`.............NEW..SEARCH..............`);

    

          // await page.screenshot({path: `./screenshots/${slipId}.png`});
          // await page.waitForNavigation();
          // await browser.close();
    
    
  } catch (e) {
    console.error(`Error: ${e}`);
  }
}


slipList.map((slipId) => {
  run(slipId);
})

