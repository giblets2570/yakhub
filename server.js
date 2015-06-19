// server.js

// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var mongoose       = require('mongoose');
var http           = require('http').Server(app);
var io             = require('socket.io')(http);
//////////////////////////////////////
var Agent 		   = require('./app/models/agent');
var Appointment    = require('./app/models/appointment');
var Client         = require('./app/models/client');
var Call           = require('./app/models/call');
var Nugget         = require('./app/models/nugget');
var Update         = require('./app/models/update');
var Admin          = require('./app/models/admin')
var jwt 		   = require('jsonwebtoken');
// configuration ===========================================

//JWT Secret
var secret = process.env.JWT_SECRET;
    
// config files
var db = require('./config/db');

// set our port
var port = process.env.PORT || 8080; 

// connect to our mongoDB database 
// (uncomment after you enter in your own credentials in config/db.js)
mongoose.connect(db.url); 

// get all data/stuff of the body (POST) parameters
// parse application/json 
app.use(bodyParser.json()); 

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); 

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override')); 

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public')); 

// routes ==================================================
io.on('connect',function(socket){
	console.log("A user "+socket.client.id+" has connected");
	socket.on('disconnect',function(){
		console.log("A user has disconnected");
	});

	socket.on('agent:info',function(data){
		console.log('Agent info');
		console.log(data);
		jwt.verify(data.authorization, secret, function(err, decoded) {
			if(!decoded)
				return;
			Agent.findById(decoded.agent_id, function(err, agent) {
                if (err)
                    return err;
                if(!agent)
                    return ({'error':'No agent of that id'});
                Client.findById(agent.client,function(err, client){
                	if(err)
                		return;
                	client_name = "None";
                	scriptURL = "";
                	if(client){
                		client_name = client.name;
                		scriptURL = client.scriptURL;
                	}
                	io.sockets.connected[socket.client.id].emit('agent:returnInfo',{'name':agent.name,'client':client_name,'scriptURL':scriptURL});
                })
		    });
		});
	});

	socket.on('client:callUpdate',function(data){
		console.log('client:callUpdate');
		jwt.verify(data.authorization, secret, function(err, decoded) {
			if(!decoded)
				return;
			Client.findById(decoded.client_id, function(err, client) {
                if (err)
                    return err;
                if(!client)
                    return ({'error':'No agent of that id'});
               	Call.find({
	                'client':client._id
	            },function(err,calls){
	                if(err)
	                    return res.send(err);
	                var leads = [];
	                var pickups = [];
	                var duration = 0;
	                for(var i = 0; i < calls.length; i++){
	                	duration += parseInt(calls[i].duration);
	                    if(calls[i].pickedup){
	                        pickups.push(calls[i]);
	                        if(calls[i].lead){
	                            leads.push(calls[i]);
	                        }
	                    }
	                }
	                io.sockets.connected[socket.client.id].emit('client:callData',{duration:duration,calls:calls,leads:leads,pickups:pickups});
	            }); 
		    });
		});
	});

	socket.on('call:update',function(data){
		console.log('callUpdate');
		jwt.verify(data.authorization, secret, function(err, decoded) {
			if(!decoded)
				return;
			Agent.findById(decoded.agent_id, function(err, agent) {
                if (err)
                    return err;
                if(!agent)
                    return ({'error':'No agent of that id'});
               	Call.find({
	                'agent':agent._id,
	                'client':agent.client
	            },function(err,calls){
	                if(err)
	                    return res.send(err);
	                var leads = [];
	                var pickups = [];
	                for(var i = 0; i < calls.length; i++){
	                    if(calls[i].pickedup){
	                        pickups.push(calls[i]);
	                        if(calls[i].lead){
	                            leads.push(calls[i]);
	                        }
	                    }
	                }
	                io.sockets.connected[socket.client.id].emit('agent:callUpdate',{calls:calls,leads:leads,pickups:pickups});
	                io.sockets.emit('client:signalUpdateCalls');
	            }); 
		    });
		});
	});

	socket.on('client:getNuggets',function(data){
		jwt.verify(data.authorization, secret, function(err, decoded) {
			if(!decoded)
				return;
			Nugget.find({
                'client':decoded.client_id
            },function(err,nuggets){
                if(err)
                    return res.send(err);
                io.sockets.connected[socket.client.id].emit('client:nuggetsData',nuggets);
            }); 
		});
	});

	socket.on('client:getLeads',function(data){
		jwt.verify(data.authorization, secret, function(err, decoded) {
			if(!decoded)
				return;
			Client.findById(decoded.client_id,function(err,client){
				if(err)
					return err;
				leadCalls = [];
				for(var i = 0; i < client.leads.length; i++){
					leadCalls.push(client.leads[i].call_id);
				};
				Call.find({'_id':{$in:leadCalls}},function(err,calls){
	                if(err)
	                    return res.send(err);
	                io.sockets.connected[socket.client.id].emit('client:leadsData',{calls:calls,leads:client.leads});
	            }); 
			});
		});
	});

	socket.on('client:followUp',function(data){
		jwt.verify(data.authorization, secret, function(err, decoded) {
			if(!decoded)
				return;
			Client.findById(decoded.client_id,function(err,client){
				if(err)
					return err;
				leadCalls = [];
				var lead = client['leads'].id(data.lead_id);
				lead.followed = data.lead_followed;
				client.save(function(err){
					if(err)
						return err;
				});
			});
		});
	});

	socket.on('agent:getCampaignUpdates',function(data){
		console.log("get campaign updates");
		jwt.verify(data.authorization, secret, function(err, decoded) {
			if(!decoded)
				return;
			console.log("here");
			Agent.findById(decoded.agent_id, function(err, agent) {
                if (err)
                    return err;
                if(!agent)
                    return ({'error':'No agent of that id'});
                console.log("Emmiting");
               	Update.find({
               		client:agent.client
               	},function(err,updates){
	            	console.log(updates);
	                if(err)
	                    return res.send(err);

	                io.sockets.connected[socket.client.id].emit('agent:campaignUpdates',updates);
	            }); 
		    });
		});
	});

	socket.on('admin:addCampaignUpdate',function(data){
		console.log('Admin add campaign update');
		jwt.verify(data.authorization, secret, function(err, decoded) {
			if(!decoded)
				return;
			Admin.findById(decoded.admin_id, function(err, admin) {
                if (err)
                    return err;
                if(!admin)
                    return ({'error':'No admin of that id'});
                console.log("Here");
               	var update = new Update();
				update.update = data.update;
				update.client = data.client;
				update.admin = true;
				update.save(function(err){
					if(err)
						return err;
					console.log("Saved");
					socket.emit('agent:newUpdates');
				});
		    });
		});
	});

	socket.on('agent:getCallData',function(data){
		jwt.verify(data.authorization, secret, function(err, decoded) {
			if(!decoded)
				return;
			Agent.findById(decoded.agent_id, function(err, agent) {
                if (err)
                    return err;
                if(!agent)
                    return ({'error':'No agent of that id'});
               	Call.find({
	                'agent':agent._id,
	                'client':agent.client
	            },function(err,calls){
	                if(err)
	                    return res.send(err);
	                var leads = [];
	                var pickups = [];
	                for(var i = 0; i < calls.length; i++){
	                    if(calls[i].pickedup){
	                        pickups.push(calls[i]);
	                        if(calls[i].lead){
	                            leads.push(calls[i]);
	                        }
	                    }
	                }
	                io.sockets.connected[socket.client.id].emit('agent:callUpdate',{calls:calls,leads:leads,pickups:pickups});
	            }); 
		    });
		});
	});

	socket.on('appointments:getAppointments',function(data){
		console.log('getAppointments');
		jwt.verify(data.authorization, secret, function(err, decoded) {
			if(!decoded)
				return;
			Agent.findById(decoded.agent_id, function(err, agent) {
                if (err)
                    return err;
                if(!agent)
                    return ({'error':'No agent of that id'});
				Appointment.find({'client':agent.client},function(err,appointments){
					mine = []
					for(i in appointments){
						if(appointments[i].agent == decoded.agent_id){
							mine.push(true);
						}else{
							mine.push(false);
						}
					}
					console.log(mine);
					io.sockets.connected[socket.client.id].emit('appointments:appointments',{appointments:appointments,mine:mine});
				});
		    });
		});
	});

	socket.on('appointments:takeAppointment',function(data){
		console.log('takeAppointment');
		Appointment.remove({_id:data.appointment},function(err,appointment){
			if(err)
                return res.send(err)
            io.sockets.emit('appointments:update');
		});
	});

	socket.on('appointments:addAppointment',function(data){
		console.log('addAppointment');
		jwt.verify(data.authorization, secret, function(err, decoded) {
            if(err)
                return err;
            if(!decoded)
				return;
            Agent.findById(decoded.agent_id, function(err, agent) {
                if (err){
                    return err;
                }
                if(!agent){  
                	io.sockets.connected[socket.client.id].emit('appointments:error',{'error':'No agent of that id!'});
                	return;
                }
                if(!agent.client){  
                	io.sockets.connected[socket.client.id].emit('appointments:error',{'error':'Need to be assigned a client to make appointments!'});
                	return;
                }
				var appointment = new Appointment();
		        appointment.number = data.number;
		        appointment.business = data.business;
		        appointment.address = data.address;
		        appointment.notes = data.notes;
		        appointment.time = new Date(data.date);
		        appointment.client = agent.client;
		        appointment.agent = agent._id;
		        appointment.save(function(err){
		            if(err)
		                return res.send(err)
		            io.sockets.emit('appointments:update');
		        });
		    });
		});
	});
});

require('./app/routes')(app,express,io); // configure our routes

// start app ===============================================
// startup our app at http://localhost:8080
// app.listen(port);  
http.listen(port,function(){
	// shoutout to the user                     
	console.log('Magic happens on port ' + port);
});             

// expose app           
exports = module.exports = app;                         

