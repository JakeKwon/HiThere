
//var http = require('http');
//var server = http.createServer();
//server.listen(8000);

var mongo = require("mongodb").MongoClient,
	client =require("socket.io").listen(8080).sockets;
//doesnt work dont know how to start mongoserver
mongo.connect("mongodb://127.0.0.1:27017", function(err,db){

	if(err) throw err;

	client.on("connection",function(socket){
		//??		
		var col = db.collection("messages"),
			sendStatus = function(s) {
				socket.emit("status", s);
			};

		// Emit all messages
		//################## u can change number
		//limit handles how many lines gets remembered
		//############_id exists in node_modules/socket.io/node_modules/package.json
		//############ id and connect exist in node_modules/socket.io/lib/ js files
		col.find().limit(1).sort({_id: 1}).toArray(function(err, res) {
			if(err) throw err;
			socket.emit("output", res);


		});

		//wait for input
		socket.on("input", function(data){
			var name = data.name,
				message = data.message,
				whitespacePattern=/^\s*$/;
			
			if(whitespacePattern.test(name) || whitespacePattern.test(message)) {
				sendStatus("Name and message is required.");
			}
			else {
				col.insert({name: name, message:message}, function() {

					// Emit latest message to All client
					client.emit("output", [data]);	

					sendStatus({
						message: "Message sent",
						clear: true
					});
				});
			}	
		});
	});	
});
// user accounts