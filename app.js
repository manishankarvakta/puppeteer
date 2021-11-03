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
const slipList = ['90710202128213716'];



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
          // save captcha as image
            await page.waitForSelector('.captcha');

            // Select the .captcha img element and save the screenshot.
            const svgImage = await page.$('.captcha');
            const captchaUrl =`captcha/${slipId}-${Date.now()}.png`;
            const box = await svgImage.boundingBox();              // this method returns an array of geometric parameters of the element in pixels.
            const x = box['x'];                                // coordinate x
            const y = box['y'];                                // coordinate y
            const w = box['width'];                            // area width
            const h = box['height'];                           // area height
            await page.screenshot({'path': `${captchaUrl}`, 'clip': {'x': x, 'y': y, 'width': w, 'height': h}, omitBackground: true});     //
           

          console.log(captchaUrl);
          // TODO
          // add captcha solver deathbycaptcha2         
          console.log(`Wait for Solve chaptcha`);
          try {
            deathbycaptcha.decodeFile(captchaUrl, 10000, async function(err, result) {

              console.log(`Captcha Found: ${result.text}`);
              // get captch 
              const cText = result.text;
              if(cText){
                // replace captcha
                await page.type("#id_captcha_1", cText);
                console.log(`Type Chaptcha: ${cText}`);
  
                // submit
                await page.click("#med-status-form-submit");
                console.log(`Submit for slip number: ${slipId}`);

                // await page.waitForSelector('body > main > div > div.ui.vertical.basic.segment.medical-status-search > div > div > div > form > div.form-fields-container > div:nth-child(5) > div > div > div.field-error-message > i');
                // Select the .captcha img element and save the screenshot.
                // const capErr = await page.$('body > main > div > div.ui.vertical.basic.segment.medical-status-search > div > div > div > form > div.form-fields-container > div:nth-child(5) > div > div > div.field-error-message > i');
                
                //   if(capErr){
                //     console.log(`Captcha is not matched. ${cText}`)
                //   }else{
                    // if success 
                    await page.waitForSelector('body > div.ui.dimmer.modals.page.transition.visible.active > div > div.content > div > div > div > div.six.wide.column.medical_center_info > table > tbody > tr:nth-child(2) > td.field_value');
                    const madical =  await page.$eval("body > div.ui.dimmer.modals.page.transition.visible.active > div > div.content > div > div > div > div.six.wide.column.medical_center_info > table > tbody > tr:nth-child(2) > td.field_value", el => el.textContent);
                    // await page.$('body > div.ui.dimmer.modals.page.transition.visible.active > div > div.content > div > div > div > div.six.wide.column.medical_center_info > table > tbody > tr:nth-child(2) > td.field_value');
                    if(madical){
                      console.log(`Payment Found for Slip: ${slipId}, Medical Center: ${madical}`);                  
                    }else{
                      console.log(`Payment not Found for Slip: ${slipId}`);  
                    }

                  // }
                
              }
           });
          } catch (error) {
            console.error(error);
            // expected output: ReferenceError: nonExistentFunction is not defined
            // Note - error messages will vary depending on browser
          }
          
          
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

