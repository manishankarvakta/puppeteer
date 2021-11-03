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

   

    console.log(start);
    console.log(base);
    console.log(lists);
    console.log(`Total Slip NO:${lists.length}`);
}

genrateSlipId('90710202128213716', 'ASC', '60');