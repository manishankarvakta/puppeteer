// imports
import express from 'express';
import path from 'path';

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