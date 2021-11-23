//var con = require('./db_connection');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

const BigchainDB = require('bigchaindb-driver')

const API_PATH = 'https://test.ipdb.io/api/v1/'
const conn = new BigchainDB.Connection(API_PATH)

const bip39 = require('bip39')


async function complementaryTokens(tokenCreator){
  const nTokens = 10000
let tokensLeft
// const tokenCreator = new BigchainDB
// .Ed25519Keypair(bip39.mnemonicToSeed('seedPhrase').slice(0,32))
let createTxId

    // Construct a transaction payload
    const tx = BigchainDB.Transaction.makeCreateTransaction({
            token: 'My Tokens',
            number_tokens: nTokens
        },
        // Metadata field, contains information about the transaction itself
        // (can be `null` if not needed)
        {
            datetime: new Date().toString()
        },
        // Output: Divisible asset, include nTokens as parameter
        [BigchainDB.Transaction.makeOutput(BigchainDB.Transaction
          .makeEd25519Condition(tokenCreator.publicKey), nTokens.toString())],
        tokenCreator.publicKey
    )

    // Sign the transaction with the private key of the token creator
    const txSigned = BigchainDB.Transaction
      .signTransaction(tx, tokenCreator.privateKey)

    // Send the transaction off to BigchainDB
    await conn.postTransactionCommit(txSigned)
        .then(res => {
          
            createTxId = res.id
            tokensLeft = nTokens
            //document.body.innerHTML ='<h3>Transaction created</h3>';
            // txSigned.id corresponds to the asset id of the tokens
            //document.body.innerHTML +=txSigned.id
        })
        console.log(createTxId)
        return createTxId;

}




module.exports.register = async (req,res) => {
   
    const user = new BigchainDB.Ed25519Keypair();
    var send=""
    var walletID=await complementaryTokens(user);
    req.body.myWallet={walletID:walletID,tokensLeft:10000}
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            req.body.keys=user
            // db.close();
            var dbo = db.db("mydb");
            var flag=0;
            var query={userName:req.body.userName}
           
            dbo.collection("users").find(query).toArray(function(err, result) {
             
              if(result.length>0){
              flag=1;
              res.send('Username already exists');
               }
               else{
                dbo.collection("users").insertOne(req.body, function(err, res) {
                  if (err) throw err;
                 
                 flag=0;
                  
                });
                send="User Created"
                res.send(send)
               }
            })
           
             
          
          
           
          });

          

}