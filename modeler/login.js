//var con = require('./db_connection');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

const BigchainDB = require('bigchaindb-driver')

const API_PATH = 'https://test.ipdb.io/api/v1/'
const conn = new BigchainDB.Connection(API_PATH)

const bip39 = require('bip39')







module.exports.login = (req,res) => {
   
    //const user = new BigchainDB.Ed25519Keypair();
       
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            
            // db.close();
            var dbo = db.db("mydb");
            query={userName:req.body.userName, password:req.body.password}
            dbo.collection("users").find(query).toArray(function(err, result) {
                if (err) throw err;
                //console.log(result);
                if(result.length>0){
                  req.session.user=result[0];
                  //console.log(req.session.user)
                  res.send('valid');
                }
              });
          });



}