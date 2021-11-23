var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

const BigchainDB = require('bigchaindb-driver')

const API_PATH = 'https://test.ipdb.io/api/v1/'
const conn = new BigchainDB.Connection(API_PATH)

const bip39 = require('bip39')

// function transferTokens(createTxId, newUser, privateKey,receiver,sender,amountToSend,tokensLeft) {

// var senderTokensLeft;
// var receiverTokensLeft;
//   // Search outputs of the transactions belonging the token creator
//   // False argument to retrieve unspent outputs
//   conn.getTransaction(createTxId)
//       .then((txOutputs) => {
//           // Create transfer transaction
//           const createTranfer = BigchainDB.Transaction
//               .makeTransferTransaction(
//                   [{
//                       tx: txOutputs,
//                       output_index: 0
//                   }],
//                   // Transaction output: Two outputs, because the whole input
//                   // must be spent
//                   [BigchainDB.Transaction.makeOutput(
//                           BigchainDB.Transaction
//                           .makeEd25519Condition(sender.keys.publicKey),
//                           (tokensLeft - amountToSend).toString()),
//                       BigchainDB.Transaction.makeOutput(
//                           BigchainDB.Transaction
//                           .makeEd25519Condition(newUser.publicKey),
//                           amountToSend)
//                   ],
//                   // Metadata (optional)
//                   {
//                       transfer_to: receiver.userName,
//                       tokens_left: tokensLeft
//                   }
//               )

//           // Sign the transaction with the tokenCreator key
//           const signedTransfer = BigchainDB.Transaction.signTransaction(createTranfer, privateKey);

         
//          conn.postTransactionCommit(signedTransfer).then(res => {
//           console.log(res)
//             // Update tokensLeft
//             senderTokensLeft=tokensLeft - amountToSend;
//             receiverTokensLeft=receiver.myWallet.tokensLeft+amountToSend;
            
//             MongoClient.connect(url, async function(err, db) {
//               if (err) throw err;
//               var dbo = db.db("mydb");
//               var obj={walletID:sender.myWallet.walletID,
//               tokensLeft:senderTokensLeft}
  
//               var myquery = { userName: sender.userName };
//                               var newvalues = { $set: {myWallet:obj} };
//                               dbo.collection("users").updateOne(myquery, newvalues, function(err, res) {
//                                 if (err) throw err;
//                                 console.log("sender document updated");
//                               });
  
//                obj={walletID:receiver.myWallet.walletID,
//               tokensLeft:receiverTokensLeft}
  
//               myquery = { userName: receiver.userName };
//                               newvalues = { $set: {myWallet:obj} };
//                               dbo.collection("users").updateOne(myquery, newvalues, function(err, res) {
//                                 if (err) throw err;
//                                 console.log("sender document updated");
//                               });
//             })
  
  
  
  
//         })
  
              
//       })
      
// }




const transferTokens = async (createTxId, newUser, privateKey,receiver,sender,amountToSend,tokensLeft) => {
  try {
    var senderTokensLeft;
    var receiverTokensLeft;
      const txOutputs = await conn.getTransaction(createTxId);
      const createTranfer = BigchainDB.Transaction.makeTransferTransaction(
          [{
              tx: txOutputs,
              output_index: 0
          }],
          // Transaction output: Two outputs, because the whole input
          // must be spent
          [BigchainDB.Transaction.makeOutput(
                  BigchainDB.Transaction
                  .makeEd25519Condition(sender.keys.publicKey),
                  (tokensLeft - amountToSend).toString()),
              BigchainDB.Transaction.makeOutput(
                  BigchainDB.Transaction
                  .makeEd25519Condition(newUser.publicKey),
                  amountToSend)
          ],
          // Metadata (optional)
          {
              transfer_to: receiver.userName,
              tokens_left: tokensLeft
          }
      );
      const signedTransfer = BigchainDB.Transaction.signTransaction(createTranfer, privateKey);
      const res = await conn.postTransactionCommit(signedTransfer);
      console.log(res);

      senderTokensLeft=tokensLeft - amountToSend;
                  receiverTokensLeft=receiver.myWallet.tokensLeft+amountToSend;
                  
                  MongoClient.connect(url, async function(err, db) {
                    if (err) throw err;
                    var dbo = db.db("mydb");
                    var obj={walletID:res.id,
                    tokensLeft:senderTokensLeft}
        
                    var myquery = { userName: sender.userName };
                                    var newvalues = { $set: {myWallet:obj} };
                                    dbo.collection("users").updateOne(myquery, newvalues, function(err, res) {
                                      if (err) throw err;
                                      console.log("sender document updated");
                                    });
        
                     obj={walletID:receiver.myWallet.walletID,
                    tokensLeft:receiverTokensLeft}
        
                    myquery = { userName: receiver.userName };
                                    newvalues = { $set: {myWallet:obj} };
                                    dbo.collection("users").updateOne(myquery, newvalues, function(err, res) {
                                      if (err) throw err;
                                      console.log("receiver document updated");
                                    });
                  })
        
        
        
        


  } catch (err) {
      console.log(err)
  }
}



module.exports.payToken = async (req,res) => {
   

    var receiver=req.body.recieverUserName;
    var query={userName:receiver}
    var amountToSend=req.body.amountToSend
    MongoClient.connect(url, async function(err, db) {
        if (err) throw err;
        

    var dbo = db.db("mydb");
    dbo.collection("users").find(query).toArray(async function(err, result) {
        if (err) throw err;
        if(result.length>0){
          receiver=result[0];
          var sender=req.session.user;
          const newOwner = receiver.keys;
        //   console.log(seller);
          let txCreatedID =  req.session.user.myWallet.walletID;
          let privateKey = req.session.user.keys.privateKey;
          let tokensLeft=req.session.user.myWallet.tokensLeft
         await transferTokens(txCreatedID, newOwner, privateKey,receiver,sender,amountToSend,tokensLeft);
      


              res.send("Tokens sent");

        }
      });
    });

   
  

}