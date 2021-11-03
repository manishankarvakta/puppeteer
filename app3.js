import express from 'express'
import path from 'path'

const app = express();
const __dirname =path.resolve(path.dirname(''))
console.log(__dirname);
app.use(express.static(`${__dirname}/viwes/`));

app.get('/', (req, res)=>{
  res.send(`
  <h1>Hello world</h1>
`)
});


app.post('/', (req, res)=>{
  res.send(`
  <h1>Hello world</h1>
`)
});

app.listen(3000, ()=>{
  console.log(`App is live at : http://localhost:3000 `)
})