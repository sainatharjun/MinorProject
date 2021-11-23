// var con = require('./db_connection');

// module.exports.login = (req,res)=>{

//     const data = req.body; // data has the credentials

//     const q = `select * from temp where mail = "${data.mail}" && password = "${data.password}"`;
//     con.query(q, (err,rows,fields)=>{
//         if(err) throw err;

//         if(rows.length == 1) 
//         {
//             const sess = req.session;
//             sess.mail = req.body.mail;
//             console.log(sess.mail);
    
//             res.send('valid');

//         }
//         else if(rows.length == 0)
//         {
//             res.send('invalid');

//         }

//     });

// }



//var con = require('./db_connection');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

const BigchainDB = require('bigchaindb-driver')

const API_PATH = 'https://test.ipdb.io/api/v1/'
const conn = new BigchainDB.Connection(API_PATH)

const bip39 = require('bip39')

async function transferOwnership(txCreatedID, newOwner, privateKey,buyer,seller) {
    // Get transaction payload by ID
    conn.getTransaction(txCreatedID)
        .then(async (txCreated) => {
            
            const createTranfer = BigchainDB.Transaction.
            makeTransferTransaction(
                // The output index 0 is the one that is being spent
                [{
                    tx: txCreated,
                    output_index: 0
                }],
                [BigchainDB.Transaction.makeOutput(
                    BigchainDB.Transaction.makeEd25519Condition(
                        newOwner.publicKey))],
                {
                    datetime: new Date().toString(),
                    value: 10000
                }
            )
            // // Sign with the key of the owner of the painting (Alice)
            const signedTransfer = await BigchainDB.Transaction
                .signTransaction(createTranfer, privateKey)

            conn.postTransactionCommit(signedTransfer)
                .then(res => {
                        console.log('<h3>Transfer Transaction created</h3>'+res.id) 

                        MongoClient.connect(url, function(err, db) {
                            if (err) throw err;
                            var dbo = db.db("mydb");
                            var myquery = { userName: buyer.userName };
                            buyer.assetsOwned.push(txCreatedID);
                            var newvalues = { $set: {assetsOwned: buyer.assetsOwned } };
                            dbo.collection("users").updateOne(myquery, newvalues, function(err, res) {
                              if (err) throw err;
                              console.log("buyer document updated");
                            });


                            var index=seller.assetsOwned.indexOf(txCreatedID);
                            console.log(txCreatedID,index,seller.assetsOwned)
                            seller.assetsOwned.splice(index, 1);
                            myquery = { userName: seller.userName };
                            newvalues = { $set: {assetsOwned: seller.assetsOwned } };
                            dbo.collection("users").updateOne(myquery, newvalues, function(err, res) {
                              if (err) throw err;
                              console.log("seller document updated");
                            });

                          });


                    })
        })
        // .then(res => {
        //     console.log('<h3>Transfer Transaction created</h3>'+res.id) 
        // })
}





module.exports.transferAsset = async (req,res) => {
   

    var buyer=req.body.buyerUserName;
    var query={userName:buyer}

    MongoClient.connect(url, async function(err, db) {
        if (err) throw err;
        

    var dbo = db.db("mydb");
    await dbo.collection("users").find(query).toArray(function(err, result) {
        if (err) throw err;
        if(result.length>0){
          buyer=result[0];
          var seller=req.session.user;
          const newOwner = buyer.keys;
        //   console.log(seller);
          let txCreatedID = req.body.txCreatedID;
          let privateKey = req.session.user.keys.privateKey;
          transferOwnership(txCreatedID, newOwner, privateKey,buyer,seller);
      


              res.send("Ownership Transferred");

        }
      });
    });

   
  

}