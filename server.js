let express = require('express')
let mongodb = require('mongodb')
let sanitizeHTML = require('sanitize-html')

let app = express()
let db

let dotenv = require('dotenv')
dotenv.config()

//let port = process.env.PORT
//if(port == null || port ==""){port = 3000}

app.use(express.static('public'))

mongodb.connect(process.env.CONNECTIONSTRING, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client){
  if(err){ throw err }
  db = client.db()
  app.listen(process.env.PORT)
  //app.listen(port)
})

app.use(express.json())
app.use(express.urlencoded({extended: false}))

function passwordProtect (req, res, next){
  res.set('WWW-Authenticate', 'Basic realm="Simple to do App')
  console.log(req.headers.authorization)
  if(req.headers.authorization == "Basic anM6anMyMDIw"){
  next()
  }else{
  res.status(401).send("Requer Autenticação")
  }
}
app.use(passwordProtect)


app.get('/', function (req, res){
  db.collection('itens').find().toArray(function(err, itens){
    if(err){ throw err }
    //console.log(itens)
    res.send(`<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Simple To-Do App</title>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
    </head>
    <body>
      <div class="container">
        <h1 class="display-4 text-center">Lista de tarefas</h1>
        <h5 class="display-8 text-center">(To-Do App)</h5>
        
        
        <div class="jumbotron p-3 shadow-sm">
          <form id="create-form" action="/add_item" method="POST">
            <div class="d-flex align-items-center">
              <input id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
              <button class="btn btn-primary">Add New Item</button>
            </div>
          </form>
        </div>
        
        <ul id="item-list" class="list-group pb-5">     
        </ul>
        
      </div>
      <script>
      let itens = ${JSON.stringify(itens)}
      </script>

    <script src="https://unpkg.com/axios/dist/axios.min.js"></script>  
    <script src="/browser.js"></script>  
    </body>
    </html>`)
  })
})

app.post('/create-item', function(req, res){
  //console.log(req.body.item)
  let safeText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}})
  db.collection('itens').insertOne({text: safeText}, function(err, info){
    res.json(info.ops[0])
  })
})

app.post('/update-item', function(req, res){
  let safeText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}})
  db.collection('itens').findOneAndUpdate({_id: new mongodb.ObjectId(req.body.id)}, {$set: {text: safeText}}, function() {
    res.send("Sucesso")
  })
})

app.post('/delete-item', function(req, res) {
  db.collection('itens').deleteOne({_id: new mongodb.ObjectId(req.body.id)}, function(){
    res.send("Sucesso")
  })
})