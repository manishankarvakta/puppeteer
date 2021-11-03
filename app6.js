import puppeteer from "puppeteer";
import dotenv from "dotenv";
import fs from "fs";
import deathbycaptcha from "deathbycaptcha2";

// 92410202128486454
deathbycaptcha.credentials = {
  // username: 'po0lash',
  // password: 'Polash1234'
  username: 'hasan22149',
  password: '424212Yy'
};

async function run() {
    // slip id array
dotenv.config();
const slipLists =  genrateSlipId('92410202128486454', 'ASC', '10');
console.log(chunk(slipLists));
const slipChunk = chunk(slipLists, 5);
process.exit()

  // console.log(`${slipId}`);
  for (let i = 0; i < slipChunk.length; i++) {
    
  
        try {
            const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,      
            args: ['--start-maximized'] 
            });

            slipChunk[i].map(async  (slipId) => {
                const url = "https://v2.gcchmc.org/medical-status-search/";
                // new page
                const page = await browser.newPage();
                // open search page
                await page.goto(url);

                // go to search by slip id
                await page.click("#id_search_variant_1");
                console.log(`Select By GCC slip number`);

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
                    await page.screenshot({'path': `${captchaUrl}`, 'clip': {'x': x+3, 'y': y, 'width': w, 'height': h}, omitBackground: true}); 
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

        } catch (error) {
            console.log(error);  
            await deleteCap(captchaUrl);            
        }
        await browser.close();
    }
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

// dealy function
function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}



// captcha delete function
function deleteCap(file){
  fs.unlink(`${file}`, function (err) {
      if (err) throw err;
      // if no error, file has been deleted successfully
      console.log(`${file} - File deleted!`);
  });
}


// Loops and iteration
function chunk(slipList, num){
  const slipLists = []
    var chunk;

  while (slipList.length > 0) {

    chunk = slipList.splice(0,num)

    slipLists.push(chunk)
    
  }
  return slipLists;
}





// // loop through silp id

    
//   slipList.map((slipId) => {
//     // console.log(slipId);    
    run();    
//   })
