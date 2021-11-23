const { Parser } = require('json2csv');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

const BigchainDB = require('bigchaindb-driver')

const API_PATH = 'https://test.ipdb.io/api/v1/'
const conn = new BigchainDB.Connection(API_PATH)

const bip39 = require('bip39')


// const { request } = require("express")


function createAsset(asset, alice) {
    var data={
      teamName:asset.teamName,
      numberOfPasses:asset.numberOfPasses,
      numberOfShots:asset.numberOfShots,
      numberOfTackles:asset.numberOfTackles,
      numberOfPassesCompleted:asset.numberOfPassesCompleted,
      numberOfShotsOnTarget:asset.numberOfShotsOnTarget,
      numberOfSuccessfulTackles:asset.numberOfSuccessfulTackles,
      numberOfGoals:asset.numberOfGoals,
      numberOfSaves:asset.numberOfSaves,
      passingAccuracy:asset.passingAccuracy,
      tackleAccuracy:asset.tackleAccuracy,
    }
    // console.log(typeof asset.convertToCSV)
    if(asset.convertToCSV=="true"){
      const fields = ['teamName', 'numberOfPasses', 'numberOfShots', 'numberOfTackles', 'numberOfPassesCompleted', 'numberOfShotsOnTarget', 'numberOfSuccessfulTackles', 'numberOfGoals', 'numberOfSaves', 'price', 'passingAccuracy', 'shotAccuracy'
  , 'txnId'];
  const opts = { fields };
  try {
    const parser =  new Parser(opts);
    data= parser.parse(data);
    data={CSVdata:data}
    console.log(data);
  } catch (err) {
    console.error(err);
  }
    }
    // Construct a transaction payload
    const txCreatePaint = BigchainDB.Transaction.makeCreateTransaction(
        // Asset field
        data,
        // Metadata field, contains information about the transaction itself
        // (can be `null` if not needed)
        {
            datetime: new Date().toString(),
            //teamName: asset.teamName,
            value: asset.price,

        },
        // Output. For this case we create a simple Ed25519 condition
        [BigchainDB.Transaction.makeOutput(
            BigchainDB.Transaction.makeEd25519Condition(alice.publicKey))],
        // Issuers
        alice.publicKey
    )
    // The owner of the painting signs the transaction
    const txSigned = BigchainDB.Transaction.signTransaction(txCreatePaint,
        alice.privateKey)

    // Send the transaction off to BigchainDB
    conn.postTransactionCommit(txSigned)
        .then(res => {
            console.log('Transaction created '+txSigned.id);
        })
       
        return txSigned.id


        
}





module.exports.createAsset = async (req,res) => {
var sessionStorage=req.session
const user=sessionStorage.user;

 const userKeys = user.keys;

const asset = req.body;
//console.log(asset)
var txnId=createAsset(asset, userKeys)
// conn.searchAssets('Barca')
//  .then(assets => console.log(assets))
// conn.getTransaction('9480e9a2bb246231f1de3e84b560feffd3abc3e2bd181c06dd4659d3b2143556').then((tx)=>{console.log(tx.outputs)})

  MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        console.log("Database created!");
        
        // db.close();
        var dbo = db.db("mydb");
        var myobj = req.body
        myobj.txnId=txnId
        dbo.collection("assets").insertOne(myobj, function(err, res) {
          if (err) throw err;
          console.log("1 document inserted");
        });
        var myquery={userName:user.userName};
        req.session.user.assetsOwned.push(txnId)
        var arr=req.session.user.assetsOwned
        //console.log(req.session.user)
        var newvalues={ $set: { assetsOwned:arr}}
        dbo.collection("users").updateOne(myquery, newvalues, function(err, res) {
          if (err) throw err;
          console.log("1 document updated",res);

        });
      });
     //console.log(req.body)
     res.send('Data entered in bigchaindb')
}
