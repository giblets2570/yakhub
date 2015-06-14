 // app/routes.js

// grab the models we want
var Agent = require('./models/agent');
var Call = require('./models/call');
var Client = require('./models/client');
var PhoneNumber = require('./models/phoneNumber');
var Appointment = require('./models/appointment');
var Nugget = require('./models/nugget');
var Admin = require('./models/admin')

var builder = require('xmlbuilder');
var jwt = require('jsonwebtoken');

// Create a twilio client:
var twilioDetails = require('../config/twilioDetails');
var twilio = require('twilio');
var capability = new twilio.Capability(twilioDetails.accountID, twilioDetails.authToken);
console.log(twilioDetails.accountID,twilioDetails.authToken,twilioDetails.appID,twilioDetails.outgoingNumber);
capability.allowClientOutgoing(twilioDetails.appID);

var outgoingNumber = twilioDetails.outgoingNumber;

//JWT Secret
var secret = process.env.JWT_SECRET;

    module.exports = function(app,express,io) {

        // server routes ===========================================================
        // handle things like api call
        // authentication routes

        var router = express.Router();

        function ensureAuthorized(req, res, next) {
            var bearerToken;
            var bearerHeader = req.headers["authorization"];
            if (typeof bearerHeader === 'undefined') {
                res.send(401);
            }
            var bearer = bearerHeader.split(" ");
            bearerToken = bearer[1];
            req.token = bearerToken;
            jwt.verify(req.token, secret, function(err, decoded) {
                if(err)
                    res.send(401);
                Agent.findById(decoded.agent_id, function(err, agent) {
                    if (err || !agent)
                        return res.send(401);

                    req.body.agent_id = agent._id;
                    req.body.client_id = agent.client;
                    next();
                });
            });
        };

        function emitAllAppointments(){
            Appointment.find(function(err,appointments){
                if(err)
                    return err;
                io.sockets.emit('appointments', appointments);
            });
        }

        // middleware to use for all requests
        router.use(function(req, res, next) {
            // do logging
            console.log('Something is happening.');
            next(); // make sure we go to the next routes and don't stop here
        });

        router.route('/admin')

            .get(function(req,res){
                Admin.find(function(err,admins){
                    if(err)
                        return res.send(err);
                    res.send(admins);
                });
            })

            .post(function(req, res){
                var admin = new Admin();
                admin.name = req.body.name;
                admin.password = admin.generateHash(req.body.password);
                admin.save(function(err){
                    if(err)
                        return res.send(err);
                    res.send({'message':'Admin created!'})
                });
            });

        router.route('/admin/:admin_id')

            .delete(function(req,res){
                Admin.remove({
                    _id: req.params.admin_id
                }, function(err, admin) {
                    if (err)
                        res.send(err);
                    res.send({ message: 'Admin successfully deleted' });
                });
            });

        router.route('/agent')

            // this is to create a new agent
            .post(function(req, res){
                Agent.findOne({'name':req.body.name},function(err,oldAgent){
                    if(err)
                        return res.send(err);
                    if(oldAgent)
                        return res.send({error:'An agent with that name already exists!'});
                    var agent = new Agent();         
                    agent.name = req.body.name;  
                    agent.password = agent.generateHash(req.body.password);
                    agent.email = req.body.email;
                    // save the bear and check for errors
                    agent.save(function(err) {
                        if (err)
                            res.send(err);

                        res.json({ message: 'Agent created!', id: agent._id});
                    });
                });
            })

            // this is to get all the agents
            .get(function(req, res){
                // use mongoose to get all agents in the database
                Agent.find(function(err, agents) {

                    // if there is an error retrieving, send the error. 
                                    // nothing after res.send(err) will execute
                    if (err)
                        res.send(err);

                    res.json(agents); // return all agents in JSON format
                });
            });


        router.route('/agent/:agent_id')

            .delete(function(req,res){
                Agent.remove({
                    _id: req.params.agent_id
                }, function(err, agent) {
                    if (err)
                        res.send(err);
                    res.send({ message: 'Agent successfully deleted' });
                });
            })

            .put(function(req,res){
                // use our bear model to find the bear we want
                Agent.findById(req.params.agent_id, function(err, agent) {

                    if (err)
                        res.send(err);

                    if(req.body.client)
                        agent.client = req.body.client;  // update the agents info

                    // save the agent
                    agent.save(function(err) {
                        if (err)
                            res.send(err);

                        res.json({ message: 'Agent updated!' });
                    });

                });
            })

            // this is to get all the agents
            .get(ensureAuthorized,function(req, res){
                Agent.findById(req.params.agent_id, function(err, agent) {
                    if (err)
                        res.send(err);
                    res.json(agent);
                });
            });

        router.route('/twilio')
            .get(ensureAuthorized,function(req, res){

                var token = capability.generate();
                res.json({'calltoken':token});
            });

        router.route('/client')

            // this is to get all the clients
            .get(function(req, res){
                // use mongoose to get all clients in the database
                Client.find(function(err, clients) {
                    // if there is an error retrieving, send the error. 
                    // nothing after res.send(err) will execute
                    if (err)
                        res.send(err);

                    res.json(clients); // return all clients in JSON format
                });
            })

            // this is to get all the clients
            .post(function(req, res){
                var client = new Client();      // create a new instance of the Bear model
                client.name = req.body.name;  // set the bears name (comes from the request)
                client.password = client.generateHash(req.body.password);
                client.email = req.body.email;
                // save the bear and check for errors
                client.save(function(err) {
                    if (err)
                        res.send(err);

                    res.json({ message: 'Client created!', id: client._id});
                });
            });

        // this is to get all the clients
        router.route('/client/:client_id')
            .get(function(req, res){
                // use mongoose to get all clients in the database
                Client.findById(req.params.agent_id, function(err, client) {
                    if (err)
                        res.send(err);
                    res.json(client);
                });
            })

            .delete(function(req,res){
                Client.remove({
                    _id: req.params.client_id
                }, function(err, client) {
                    if (err)
                        res.send(err);
                    res.send({ message: 'Client successfully deleted' });
                });
            });


        router.route('/call')
            .get(function(req,res){
                Call.find(function(err,calls){
                    if(err)
                        res.send(err);
                    res.json(calls);
                });
            })


            .delete(function(req,res){
                Call.remove(function(err){
                    if (err)
                        res.send(err);
                    res.json({ message: 'Calls successfully deleted' });
                });
            });

        // router.route('/call/agent')
        //     .get(function(req,res){
        //         Call.find({
        //             'agent':req.body.agent_id,
        //             'client':req.body.client_id
        //         },function(err,calls){
        //             if(err)
        //                 return res.send(err);
        //             var leads = [];
        //             var pickups = [];
        //             for(var i = 0; i < calls.length; i++){
        //                 if(calls[i].pickedup){
        //                     pickups.push(calls[i]);
        //                     if(calls[i].lead){
        //                         leads.push(calls[i]);
        //                     }
        //                 }
        //             }
        //             return res.send({calls:calls,leads:leads,pickups:pickups});
        //         });
        //     });

        router.route('/call/client')
            .get(ensureAuthorized, function(req,res){
                Call.find({'client':req.body.client_id},function(err,calls){
                    if(err)
                        return res.send(err);
                    var leads = [];
                    for(var i = 0; i < calls.length; i++){
                        if(calls[i].lead){
                            leads.push(calls[i]);
                        }
                    }
                    res.send({calls:calls,leads:leads});
                });
            });


        router.route('/phoneNumber')
            .get(ensureAuthorized,function(req,res){
                Agent.findById(req.body.agent_id,function(err,agent){
                    if(err)
                        return res.send(err);
                    if(!agent.client)
                        return res.send({'error':'You are not on a campaign!'});
                    PhoneNumber.findById(agent.calling.phone_number_id, function(err1,prevNumber){
                        if(err1)
                            res.send(err1);

                        if(prevNumber){
                            if(!prevNumber.called){
                                return res.send({
                                    message:"You haven't called the previous number!",
                                    numberData: prevNumber
                                });
                            }
                        }
                        PhoneNumber.findOne({'calling':false,'called':false,'client':agent.client}, function(err3,number){
                            if(err3)
                                res.send(err3);
                            if(!number)
                                return res.send({'error': 'No more numbers!'});
                            number.calling = true;
                            number.save(function(err4){
                                if(err4)
                                    res.send(err4);

                                agent.calling.phone_number_id = number._id;
                                agent.calling.call_id = null;
                                agent.save(function(err5){
                                    if(err5)
                                        res.send(err5);
                                    res.send({
                                        message:"Here's the next number number!",
                                        numberData: number
                                    });
                                });
                            });
                        });
                    });
                });
            })

            .post(ensureAuthorized, function(req,res){
                var phoneNumber = new PhoneNumber();
                phoneNumber.client = req.body.client_id;
                phoneNumber.number = req.body.number;
                phoneNumber.business = req.body.business;
                phoneNumber.address = req.body.address;
                phoneNumber.save(function(err){
                    if(err)
                        return res.send(err);
                    Agent.findById(req.body.agent_id,function(err1,agent){
                        if(err1)
                            return res.send(err1);
                        if(!agent)
                            return res.send({'error':'agent does not exist'});
                        agent.calling.phone_number_id = phoneNumber._id;
                        agent.calling.call_id = null;
                        agent.save(function(err2){
                            if(err2)
                                return res.send(err2);
                            return res.send({message: 'Success! Number input!',numberData: phoneNumber});
                        })
                    });
                });
            })

            .put(ensureAuthorized,function(req,res){
                Agent.findById(req.body.agent_id,function(err,agent){
                    var phone_number_id = agent.calling.phone_number_id;
                    PhoneNumber.findById(phone_number_id, function(err1,number){
                        if(err1)
                            return res.send(err1);
                        if(number == null){
                            return res.send({message:'No phone number! Problem.'});
                        }
                        if(number.called == true)
                            return res.send({message:'Complete!'});
                        number.calling = false;
                        number.save(function(err2){
                            if(err2)
                                return res.send(err2);
                            agent.calling.phone_number_id = null;
                            agent.calling.calling_id = null;
                            agent.save(function(err3){
                                if(err3)
                                    return res.send(err3);
                                return res.send()
                            });
                        });
                    });
                });
            })

            .delete(ensureAuthorized,function(req,res){
                PhoneNumber.remove({
                    client: req.body.client_id
                },function(err, numbers) {
                    if (err)
                        res.send(err);
                    res.json({ message: 'Numbers successfully deleted' });
                });
            });

        router.route('/phoneNumbers')
            .get(function(req,res){
                PhoneNumber.find(function(err,phoneNumbers){
                    if(err)
                        res.send(err);
                    res.send(phoneNumbers);
                })
            })
            .post(function(req,res){
                console.log(req.body);
                var phoneNumbers = req.body.numbers.phoneNumbers;
                console.log(phoneNumbers);
                console.log(req.body.number_client_id);
                for(var i = 0; i < phoneNumbers.length; i++){
                    var phoneNumber = new PhoneNumber();
                    phoneNumber.client = req.body.number_client_id;
                    phoneNumber.number = phoneNumbers[i].number;
                    phoneNumber.business = phoneNumbers[i].business;
                    phoneNumber.address = phoneNumbers[i].address;
                    phoneNumber.save(function(err){
                        if(err)
                            res.send(err);
                    });
                }
                res.send({message:'Numbers added to database!'});
            })
            .delete(function(req,res){
                PhoneNumber.remove(function(err, numbers) {
                    if (err)
                        res.send(err);
                    res.json({ message: 'Numbers successfully deleted' });
                });
            });

        router.route('/appointment')

            .get(function(req,res){
                Appointment.find(function(err,appointments){
                    if(err)
                        return err;
                    res.send(appointments);
                });
            })

            .post(ensureAuthorized, function(req,res){
                var appointment = new Appointment();
                appointment.number = req.body.number;
                appointment.business = req.body.business;
                appointment.address = req.body.address;
                appointment.time = new Date(req.body.date);
                appointment.client = req.body.client_id;
                appointment.agent = req.body.agent_id;
                appointment.save(function(err){
                    if(err)
                        return res.send(err)
                    emitAllAppointments();
                    res.send({'message':'Appointment saved!'});
                });
            })

            .delete(function(req,res){
                Appointment.remove(function(err,appointment){
                    if(err)
                        return res.send(err);
                    emitAllAppointments();
                    res.send({'message':'Appointments deleted!'})
                });
            });

        router.route('/appointment/:appointment_id')

            .delete(ensureAuthorized, function(req,res){
                Appointment.remove({
                    _id: req.params.appointment_id
                },function(err,appointment){
                    if(err)
                        return res.send(err);
                    emitAllAppointments();
                    res.send({'message':'Appointment deleted!'})
                });
            });

        router.route('/nugget')

            .get(function(req,res){
                Nugget.find(function(err,nuggets){
                    if(err)
                        return res.send(err);
                    res.send(nuggets);
                })
            })

            .post(ensureAuthorized, function(req,res){
                var nugget = new Nugget();
                nugget.agent = req.body.agent_id;
                nugget.client = req.body.client_id;
                nugget.text = req.body.nugget;
                nugget.save(function(err1){
                    if(err1)
                        return res.send(err1);
                    res.send({'message':'Nugget added!'});
                });
            });

        /////////////////////////////////////////////////////////
        //   These are the big methods
        /////////////////////////////////////////////////////////

        router.route('/call/notes')

            .get(ensureAuthorized,function(req,res){
                Call.find({'agent':req.body.agent_id},function(err,calls){
                    res.send(calls);
                });  
            })

            .put(ensureAuthorized,function(req,res){
                Agent.findById(req.body.agent_id,function(err,agent){
                    var call_id = agent.calling.call_id;

                    Call.findById(call_id,function(err1, call){
                        if(err1)
                            res.send(err1);
                        if(!call)
                            res.send({error:'No call of this id!',success: false});

                        
                        call.pickedup = req.body.pickedup;
                        call.enthusiasm = req.body.enthusiasm;
                        var oldCallLead = call.lead;
                        call.lead = req.body.lead;
                        call.notes = req.body.notes;
                        call.save(function(err2){
                            if(err2)
                                res.send(err2)
                            if(oldCallLead != true && call.lead == true){
                                Client.findById(agent.client,function(err,client){
                                    if(err)
                                        return res.send(err);
                                    if(!client)
                                        return res.send({'error':'Client gone wrong!'});
                                    var lead = {
                                        call_id: call._id
                                    }
                                    client.leads.push(lead);
                                    client.save(function(err){
                                        if(err)
                                            return res.send(err);
                                        return res.send({ 'message': 'Notes kept safe!','success': true});
                                    });
                                });
                            }else{
                                return res.send({ 'message': 'Notes kept safe!','success': true});
                            }
                        });
                    });
                });
            });

        router.post('/call/recording/:agent_id/:call_id',function(req,res){
            Agent.findById(req.params.agent_id, function(err, agent) {
                if (err)
                    res.send(err);
                var client_id = agent.client;

                Call.findById(req.params.call_id,function(err1, call){
                    if(err1)
                        res.send(err1);
                    if(!call)
                        res.send('Error');    
                    
                    call.RecordingUrl = req.body.RecordingUrl;

                    call.save(function(err2){
                        if(err2)
                            res.send(err2)

                        var xml = builder.create('Response')
                            .ele('Say', 'Thanks for calling')
                          .end({ pretty: true});
                        res.header('Content-Type','text/xml').send(xml);
                    });
                });
            });
        });

        router.post('/outbound',function(req,res){
            // var calledNumber = req.body.calledNumber;
            // need to set up the number being crossed off the list

            jwt.verify(req.body.authorization, secret, function(err, decoded) {
                if(err)
                    res.send(401);

                Agent.findById(decoded.agent_id, function(err, agent) {
                    if (err)
                        res.send(err);
                    if(!agent)
                        res.send(401);

                    var agent_id = agent._id;
                    var client_id = agent.client;

                    PhoneNumber.findById(agent.calling.phone_number_id,function(err, phoneNumber){
                        if(!phoneNumber)
                            res.send({message: 'Number does not exist'});

                        phoneNumber.called = true;
                        var calledNumber = phoneNumber.number;
                        var business = phoneNumber.business;
                        var address = phoneNumber.address;
                        phoneNumber.save(function(err){
                            if(err)
                                res.send(err);

                            call = new Call()
                            call.agent = agent_id;
                            call.client = client_id;
                            call.number = calledNumber;
                            call.business = business;
                            call.address = address;

                            call.phoneNumber = phoneNumber._id;

                            var actionURL = '/api/call/recording/' + agent_id +'/' + call._id;

                            call.save(function(err){
                                if(err)
                                    res.send(err)

                                agent.calling.call_id = call._id;

                                agent.save(function(err1){
                                    if(err1)
                                        res.send(err1)

                                    var resp = new twilio.TwimlResponse();

                                    resp.dial({
                                        action: actionURL,
                                        callerId: outgoingNumber,
                                        record: true
                                    },function(node){
                                        node.number(calledNumber,{});
                                    });
                                    
                                    res.send(resp.toString());
                                });
                            });
                        });
                    });
                });
            });
        });


        // REGISTER OUR ROUTES -------------------------------
        // all of our API routes will be prefixed with /api
        app.use('/api', router);

        // frontend routes =========================================================
        // route to handle all angular requests

        app.post('/agent_authenticate',function(req,res){
            Agent.findOne({'name':req.body.name}, function(err, agent) {
                if (err)
                    res.send(err);
                if(agent){
                    if(agent.validPassword(req.body.password)) {
                        var token = jwt.sign({ agent_id : agent._id }, secret);
                        res.json({'message':'Authentication successful!','token':token});
                    }else{
                        res.json({'message':'Wrong password/username'});
                    }
                }else{
                    res.json({'message':'Wrong password/username'});
                }
            });
        });

        app.post('/admin_authenticate',function(req,res){
            Admin.findOne({'name':req.body.name}, function(err, admin) {
                if (err)
                    res.send(err);
                if(admin){
                    if(admin.validPassword(req.body.password)) {
                        var token = jwt.sign({ admin_id : admin._id }, secret);
                        res.json({'message':'Authentication successful!','token':token});
                    }else{
                        res.json({'message':'Wrong password/username'});
                    }
                }else{
                    res.json({'message':'Wrong password/username'});
                }
            });
        });

        app.post('/client_authenticate',function(req,res){
            Client.findOne({'name':req.body.name}, function(err, client) {
                if (err)
                    res.send(err);
                if(client){
                    if(client.validPassword(req.body.password)) {
                        var token = jwt.sign({ client_id : client._id }, secret);
                        res.json({'message':'Authentication successful!','token':token});
                    }else{
                        res.json({'message':'Wrong password/username'});
                    }
                }else{
                    res.json({'message':'Wrong password/username'});
                }
            });
        });

        app.use(function(req, res) {
            res.sendfile('./public/index.html'); // load our public/index.html file
        });

    };

