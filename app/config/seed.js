/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Agent = require('../api/agent/agent.model');
var Client = require('../api/client/client.model');
var Campaign = require('../api/campaign/campaign.model');
var Call = require('../api/call/call.model');
var Lead = require('../api/lead/lead.model');
var Message = require('../api/message/message.model');

Message.find({}).remove(function() {
  console.log('Messages removed')
})

Lead.find({}).remove(function() {
  console.log('Leads removed')
})

// Agent.find({}).remove(function() {
//   var hour = 3600000;
//   var now = (new Date()).valueOf();
//   var day = now - now%24*hour;
//   var agent = new Agent();
//   agent._id = "56405a4b7b61d34cad2bd9f5";
//   agent.name = "Test agent";
//   agent.url_name = agent.urlSafeName(agent.name);
//   agent.password = agent.generateHash("Test");
//   agent.campaigns=[{
//     campaign:"5640c95b7449cf4cbf024b1f",
//     campaign_name:"Test campaign 1",
//     date_started: new Date(day - 2*24*hour)
//   },{
//     campaign:"5640c95b7449cf4cbf024b2b",
//     campaign_name:"Test campaign 2",
//     date_started: new Date(day - 9*24*hour)
//   }];
//   agent.save(function(err){
//     console.log('finished populating 1 agent');
//   })
//   var agent = new Agent();
//   agent._id = "56405a4b7b61d34cad2bdr56";
//   agent.name = "Test agent 2";
//   agent.url_name = agent.urlSafeName(agent.name);
//   agent.password = agent.generateHash("Test");
//   agent.campaigns=[{
//     campaign:"5640c95b7449cf4cbf024b1f",
//     campaign_name:"Test campaign 1",
//     date_started: new Date(day - 7*24*hour)
//   },{
//     campaign:"5640c95b7449cf4cbf024b2b",
//     campaign_name:"Test campaign 2",
//     date_started: new Date(day - 5*24*hour)
//   }];
//   agent.save(function(err){
//     console.log('finished populating 2 agent');
//   })
// });

Client.find({}).remove(function() {
  var client = new Client();
  // client._id = "56405a8d099e1364ad748e88";
  client.name = "Test";
  client.url_name = client.urlSafeName(client.name);
  client.password = client.generateHash("Test");
  // client.campaigns = [{
  //   campaign: "5640c95b7449cf4cbf024b1f",
  //   campaign_name: "Test campaign 1"
  // },{
  //   campaign: "5640c95b7449cf4cbf024b2b",
  //   campaign_name: "Test campaign 2"
  // }];
  // client.notifications = [{
  //   campaign: "5640c95b7449cf4cbf024b1f",
  //   seen_all: false,
  //   last_checked : new Date()
  // },{
  //   campaign: "5640c95b7449cf4cbf024b2b",
  //   seen_all: false,
  //   last_checked : new Date()
  // }]
  client.save(function(err){
    console.log('finished populating clients');
  })
});

Campaign.find({}).remove();
// Campaign.find({}).remove(function() {
//   var campaign = new Campaign();
//   var hour = 3600000;
//   var settime = (new Date()).setMinutes(0,0,0);
//   console.log(settime);
//   campaign._id = "5640c95b7449cf4cbf024b1f";
//   campaign.name = "Test campaign 1";
//   campaign.url_name = campaign.urlSafeName(campaign.name);
//   campaign.client = "56405a8d099e1364ad748e88";
//   campaign.client_name = "Test client";
//   campaign.agents = [{
//     agent: "56405a4b7b61d34cad2bd9f5",
//     agent_name: "Test agent",
//     active: true
//   },{
//     agent: "56405a4b7b61d34cad2bdr56",
//     agent_name: "Test agent 2",
//     active: true
//   }];
//   campaign.available_slots = [{
//     time: new Date(settime-24*36*hour),
//     num_agents: 2
//   },{
//     time: new Date(settime-24*21*hour),
//     num_agents: 2
//   },{
//     time: new Date(settime),
//     num_agents: 2
//   },{
//     time: new Date(settime+hour),
//     num_agents: 2
//   }];
//   campaign.allocated_slots = [{
//     time: new Date(settime-24*36*hour),
//     created: new Date(settime-24*36*hour),
//     agent: "56405a4b7b61d34cad2bdr56",
//     agent_name: "Test agent 2"
//   },{
//     time: new Date(settime+hour),
//     created: new Date(settime+hour),
//     agent: "56405a4b7b61d34cad2bdr56",
//     agent_name: "Test agent 2"
//   }];
//   campaign.save(function(err){
//     console.log('finished populating 1 campaign');
//     var campaign = new Campaign();
//     campaign._id = "5640c95b7449cf4cbf024b2b";
//     campaign.name = "Test campaign 2";
//     campaign.agents = [{
//       agent: "56405a4b7b61d34cad2bd9f5",
//       agent_name: "Test agent",
//       active: true
//     },{
//       agent: "56405a4b7b61d34cad2bdr56",
//       agent_name: "Test agent 2",
//       active: true
//     }];
//     campaign.url_name = campaign.urlSafeName(campaign.name);
//     campaign.client = "56405a8d099e1364ad748e88";
//     campaign.client_name = "Test client";
//     campaign.available_slots = [{
//       time: new Date(settime),
//       num_agents: 1
//     },{
//       time: new Date(settime+hour),
//       num_agents: 1
//     }];
//     campaign.save(function(err){
//       console.log('finished populating 2 campaign');
//     });
//   });
// });

// Call.find({}).remove(function() {
//   var call1 = new Call();
//   call1.client = "56405a8d099e1364ad748e88";
//   call1.client_name = "Test client";
//   call1.agent = "56405a4b7b61d34cad2bd9f5";
//   call1.agent_name = "Test agent";
//   call1.duration = 14;
//   call1.campaign = "5640c95b7449cf4cbf024b1f";
//   call1.recording_url = "http://api.twilio.com/2010-04-01/Accounts/AC9e540d572431d3af66681b92102093ca/Recordings/REbfd32b0e53c0a0e57fa8f8eb05bd7b45";
//   // Data from the call
//   call1.contact_info = {
//     number: '0046532432455',
//     company: 'Crap company',
//     email: 'crappy@crap.com',
//     person: {
//       name: 'Crap McCrap',
//       role: 'CrapEO'
//     },
//   };
//   call1.lead_info = {
//     number: '00447547968608',
//     company: 'Tom\'s business',
//     address: 'Baltic quay',
//     email: 'tom@hotmail.com',
//     person: {
//       name: 'Tom Murray',
//       role: 'CTO'
//     },
//   };
//   call1.outcome = 'Success';
//   call1.contact_name = 'Tom 1';
//   call1.rating = 3;
//   call1.notes = "dslkafj kldasjfl kdsjaflk ;sdjaflk ajdslfjalf jlkdsajf;l dasjf lk;dsjaf ljsadflk ajsfl;j asdlkf jadslf dsal;j flsaj";
//   call1.answers = [{
//     question: 'Did they provide x?',
//     answer: "fdsaf dsa asd fsldfj kldasjfksjaf ldsajfl;kdsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   },{
//     question: 'Did they provide y?',
//     answer: "ds fasf saf dsf as     asf sdasldfj kldasjfksjaf ldsajfl;kdsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   },{
//     question: 'Did they provide c?',
//     answer: "fdsafadsf sldfj kldasjfksjaf ldsajfl;kdsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   },{
//     question: 'Did they provide z?',
//     answer: "sadfads assldfj kldasjfksjaf ldsajfl;kdsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   }],
//   call1.save(function(err){
//     console.log("Finished seeding call 1");
//   });
//   var call2 = new Call();
//   call2.client = "56405a8d099e1364ad748e88";
//   call2.client_name = "Test client";
//   call2.agent = "56405a4b7b61d34cad2bd9f5";
//   call2.agent_name = "Test agent";
//   call2.duration = 23;
//   call2.campaign = "5640c95b7449cf4cbf024b1f";
//   call2.recording_url = "http://api.twilio.com/2010-04-01/Accounts/AC9e540d572431d3af66681b92102093ca/Recordings/REbfd32b0e53c0a0e57fa8f8eb05bd7b45";
//   // Data from the call
//   call2.contact_info = {
//     number: '0046532432455',
//     company: 'Crap company',
//     email: 'crappy@crap.com',
//     person: {
//       name: 'Crap McCrap',
//       role: 'CrapEO'
//     },
//   };
//   call2.lead_info = {
//     number: '00447547968608',
//     company: 'Tom\'s business',
//     address: 'Baltic quay',
//     email: 'tom@hotmail.com',
//     person: {
//       name: 'Tom Murray',
//       role: 'CTO'
//     },
//   };
//   call2.outcome = 'Success';
//   call2.contact_name = 'Tom 2';
//   call2.rating = 1;
//   call2.notes = "dslkafj kldasjfl kdsjaflk ;sdjaflk ajdslfjalf jlkdsajf;l dasjf lk;dsjaf ljsadflk ajsfl;j asdlkf jadslf dsal;j flsaj";
//   call2.answers = [{
//     question: 'Did they provide x?',
//     answer: "sldfj kldsaf sad asjfksjaf ldsajfl;kdsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   },{
//     question: 'Did they provide y?',
//     answer: "sldfj kldasjfksjaf ldsajfl;kfdsaf sadf dsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   },{
//     question: 'Did they provide z?',
//     answer: "sldfj kldasjfksjaf ldsajdsaf dsaf sadf asdf sadf asdf asdf asdf asdf sadf sadf sadf adsf sadfsadfl;kfdsaf sadf dsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   }],
//   call2.save(function(err){
//     console.log("Finished seeding call 2");
//   });
// var call3 = new Call();
//   call3.client = "56405a8d099e1364ad748e88";
//   call3.client_name = "Test client";
//   call3.agent = "56405a4b7b61d34cad2bd9f5";
//   call3.agent_name = "Test agent";
//   call3.duration = 23;
//   call3.campaign = "5640c95b7449cf4cbf024b1f";
//   call3.recording_url = "http://api.twilio.com/2010-04-01/Accounts/AC9e540d572431d3af66681b92102093ca/Recordings/REbfd32b0e53c0a0e57fa8f8eb05bd7b45";
//   // Data from the call
//   call3.contact_info = {
//     number: '0046532432455',
//     company: 'Crap company',
//     email: 'crappy@crap.com',
//     person: {
//       name: 'Crap McCrap',
//       role: 'CrapEO'
//     },
//   };
//   call3.lead_info = {
//     number: '00447547968608',
//     company: 'Tom\'s business',
//     address: 'Baltic quay',
//     email: 'tom@hotmail.com',
//     person: {
//       name: 'Tom Murray',
//       role: 'CTO'
//     },
//   };
//   call3.outcome = 'Success';
//   call3.contact_name = 'Tom 2';
//   call3.rating = 1;
//   call3.notes = "dslkafj kldasjfl kdsjaflk ;sdjaflk ajdslfjalf jlkdsajf;l dasjf lk;dsjaf ljsadflk ajsfl;j asdlkf jadslf dsal;j flsaj";
//   call3.answers = [{
//     question: 'Did they provide x?',
//     answer: "sldfj kldsaf sad asjfksjaf ldsajfl;kdsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   },{
//     question: 'Did they provide y?',
//     answer: "sldfj kldasjfksjaf ldsajfl;kfdsaf sadf dsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   }],
//   call3.save(function(err){
//     console.log("Finished seeding call 3");
//   });
// var call4 = new Call();
//   call4.client = "56405a8d099e1364ad748e88";
//   call4.client_name = "Test client";
//   call4.agent = "56405a4b7b61d34cad2bd9f5";
//   call4.agent_name = "Test agent";
//   call4.duration = 23;
//   call4.campaign = "5640c95b7449cf4cbf024b1f";
//   call4.recording_url = "http://api.twilio.com/2010-04-01/Accounts/AC9e540d572431d3af66681b92102093ca/Recordings/REbfd32b0e53c0a0e57fa8f8eb05bd7b45";
//   // Data from the call
//   call4.contact_info = {
//     number: '0046532432455',
//     company: 'Crap company',
//     email: 'crappy@crap.com',
//     person: {
//       name: 'Crap McCrap',
//       role: 'CrapEO'
//     },
//   };
//   call4.lead_info = {
//     number: '00447547968608',
//     company: 'Tom\'s business',
//     address: 'Baltic quay',
//     email: 'tom@hotmail.com',
//     person: {
//       name: 'Tom Murray',
//       role: 'CTO'
//     },
//   };
//   call4.outcome = 'Success';
//   call4.contact_name = 'Tom 2';
//   call4.rating = 1;
//   call4.notes = "dslkafj kldasjfl kdsjaflk ;sdjaflk ajdslfjalf jlkdsajf;l dasjf lk;dsjaf ljsadflk ajsfl;j asdlkf jadslf dsal;j flsaj";
//   call4.answers = [{
//     question: 'Did they provide x?',
//     answer: "sldfj kldsaf sad asjfksjaf ldsajfl;kdsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   },{
//     question: 'Did they provide y?',
//     answer: "sldfj kldasjfksjaf ldsajfl;kfdsaf sadf dsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   }],
//   call4.save(function(err){
//     console.log("Finished seeding call 4");
//   });
// var call5 = new Call();
//   call5.client = "56405a8d099e1364ad748e88";
//   call5.client_name = "Test client";
//   call5.agent = "56405a4b7b61d34cad2bd9f5";
//   call5.agent_name = "Test agent";
//   call5.duration = 23;
//   call5.campaign = "5640c95b7449cf4cbf024b1f";
//   call5.recording_url = "http://api.twilio.com/2010-04-01/Accounts/AC9e540d572431d3af66681b92102093ca/Recordings/REbfd32b0e53c0a0e57fa8f8eb05bd7b45";
//   // Data from the call
//   call5.contact_info = {
//     number: '0046532432455',
//     company: 'Crap company',
//     email: 'crappy@crap.com',
//     person: {
//       name: 'Crap McCrap',
//       role: 'CrapEO'
//     },
//   };
//   call5.lead_info = {
//     number: '00447547968608',
//     company: 'Tom\'s business',
//     address: 'Baltic quay',
//     email: 'tom@hotmail.com',
//     person: {
//       name: 'Tom Murray',
//       role: 'CTO'
//     },
//   };
//   call5.outcome = 'Success';
//   call5.contact_name = 'Tom 2';
//   call5.rating = 1;
//   call5.notes = "dslkafj kldasjfl kdsjaflk ;sdjaflk ajdslfjalf jlkdsajf;l dasjf lk;dsjaf ljsadflk ajsfl;j asdlkf jadslf dsal;j flsaj";
//   call5.answers = [{
//     question: 'Did they provide x?',
//     answer: "sldfj kldsaf sad asjfksjaf ldsajfl;kdsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   },{
//     question: 'Did they provide y?',
//     answer: "sldfj kldasjfksjaf ldsajfl;kfdsaf sadf dsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   },{
//     question: 'Did they provide z?',
//     answer: "sldfj kldasjfksjaf ldsajdsaf dsaf sadf asdf sadf asdf asdf asdf asdf sadf sadf sadf adsf sadfsadfl;kfdsaf sadf dsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   }],
//   call5.save(function(err){
//     console.log("Finished seeding call 5");
//   });
// var call6 = new Call();
//   call6.client = "56405a8d099e1364ad748e88";
//   call6.client_name = "Test client";
//   call6.agent = "56405a4b7b61d34cad2bd9f5";
//   call6.agent_name = "Test agent";
//   call6.duration = 23;
//   call6.campaign = "5640c95b7449cf4cbf024b1f";
//   call6.recording_url = "http://api.twilio.com/2010-04-01/Accounts/AC9e540d572431d3af66681b92102093ca/Recordings/REbfd32b0e53c0a0e57fa8f8eb05bd7b45";
//   // Data from the call
//   call6.contact_info = {
//     number: '0046532432455',
//     company: 'Crap company',
//     email: 'crappy@crap.com',
//     person: {
//       name: 'Crap McCrap',
//       role: 'CrapEO'
//     },
//   };
//   call6.lead_info = {
//     number: '00447547968608',
//     company: 'Tom\'s business',
//     address: 'Baltic quay',
//     email: 'tom@hotmail.com',
//     person: {
//       name: 'Tom Murray',
//       role: 'CTO'
//     },
//   };
//   call6.outcome = 'Success';
//   call6.contact_name = 'Tom 2';
//   call6.rating = 1;
//   call6.notes = "dslkafj kldasjfl kdsjaflk ;sdjaflk ajdslfjalf jlkdsajf;l dasjf lk;dsjaf ljsadflk ajsfl;j asdlkf jadslf dsal;j flsaj";
//   call6.answers = [{
//     question: 'Did they provide x?',
//     answer: "sldfj kldsaf sad asjfksjaf ldsajfl;kdsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   },{
//     question: 'Did they provide y?',
//     answer: "sldfj kldasjfksjaf ldsajfl;kfdsaf sadf dsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   }],
//   call6.save(function(err){
//     console.log("Finished seeding call 6");
//   });
// var call7 = new Call();
//   call7.client = "56405a8d099e1364ad748e88";
//   call7.client_name = "Test client";
//   call7.agent = "56405a4b7b61d34cad2bd9f5";
//   call7.agent_name = "Test agent";
//   call7.duration = 23;
//   call7.campaign = "5640c95b7449cf4cbf024b1f";
//   call7.recording_url = "http://api.twilio.com/2010-04-01/Accounts/AC9e540d572431d3af66681b92102093ca/Recordings/REbfd32b0e53c0a0e57fa8f8eb05bd7b45";
//   // Data from the call
//   call7.contact_info = {
//     number: '0046532432455',
//     company: 'Crap company',
//     email: 'crappy@crap.com',
//     person: {
//       name: 'Crap McCrap',
//       role: 'CrapEO'
//     },
//   };
//   call7.lead_info = {
//     number: '00447547968608',
//     company: 'Tom\'s business',
//     address: 'Baltic quay',
//     email: 'tom@hotmail.com',
//     person: {
//       name: 'Tom Murray',
//       role: 'CTO'
//     },
//   };
//   call7.outcome = 'Success';
//   call7.contact_name = 'Tom 2';
//   call7.rating = 1;
//   call7.notes = "dslkafj kldasjfl kdsjaflk ;sdjaflk ajdslfjalf jlkdsajf;l dasjf lk;dsjaf ljsadflk ajsfl;j asdlkf jadslf dsal;j flsaj";
//   call7.answers = [{
//     question: 'Did they provide x?',
//     answer: "sldfj kldsaf sad asjfksjaf ldsajfl;kdsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   },{
//     question: 'Did they provide y?',
//     answer: "sldfj kldasjfksjaf ldsajfl;kfdsaf sadf dsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   }],
//   call7.save(function(err){
//     console.log("Finished seeding call 7");
//   });
// var call8 = new Call();
//   call8.client = "56405a8d099e1364ad748e88";
//   call8.client_name = "Test client";
//   call8.agent = "56405a4b7b61d34cad2bd9f5";
//   call8.agent_name = "Test agent";
//   call8.duration = 23;
//   call8.campaign = "5640c95b7449cf4cbf024b1f";
//   call8.recording_url = "http://api.twilio.com/2010-04-01/Accounts/AC9e540d572431d3af66681b92102093ca/Recordings/REbfd32b0e53c0a0e57fa8f8eb05bd7b45";
//   // Data from the call
//   call8.contact_info = {
//     number: '0046532432455',
//     company: 'Crap company',
//     email: 'crappy@crap.com',
//     person: {
//       name: 'Crap McCrap',
//       role: 'CrapEO'
//     },
//   };
//   call8.lead_info = {
//     number: '00447547968608',
//     company: 'Tom\'s business',
//     address: 'Baltic quay',
//     email: 'tom@hotmail.com',
//     person: {
//       name: 'Tom Murray',
//       role: 'CTO'
//     },
//   };
//   call8.outcome = 'Success';
//   call8.contact_name = 'Tom 2';
//   call8.rating = 1;
//   call8.notes = "dslkafj kldasjfl kdsjaflk ;sdjaflk ajdslfjalf jlkdsajf;l dasjf lk;dsjaf ljsadflk ajsfl;j asdlkf jadslf dsal;j flsaj";
//   call8.answers = [{
//     question: 'Did they provide x?',
//     answer: "sldfj kldsaf sad asjfksjaf ldsajfl;kdsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   },{
//     question: 'Did they provide y?',
//     answer: "sldfj kldasjfksjaf ldsajfl;kfdsaf sadf dsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   }],
//   call8.save(function(err){
//     console.log("Finished seeding call 8");
//   });
// var call9 = new Call();
//   call9.client = "56405a8d099e1364ad748e88";
//   call9.client_name = "Test client";
//   call9.agent = "56405a4b7b61d34cad2bd9f5";
//   call9.agent_name = "Test agent";
//   call9.duration = 23;
//   call9.campaign = "5640c95b7449cf4cbf024b1f";
//   call9.recording_url = "http://api.twilio.com/2010-04-01/Accounts/AC9e540d572431d3af66681b92102093ca/Recordings/REbfd32b0e53c0a0e57fa8f8eb05bd7b45";
//   // Data from the call
//   call9.contact_info = {
//     number: '0046532432455',
//     company: 'Crap company',
//     email: 'crappy@crap.com',
//     person: {
//       name: 'Crap McCrap',
//       role: 'CrapEO'
//     },
//   };
//   call9.lead_info = {
//     number: '00447547968608',
//     company: 'Tom\'s business',
//     address: 'Baltic quay',
//     email: 'tom@hotmail.com',
//     person: {
//       name: 'Tom Murray',
//       role: 'CTO'
//     },
//   };
//   call9.outcome = 'Success';
//   call9.contact_name = 'Tom 2';
//   call9.rating = 1;
//   call9.notes = "dslkafj kldasjfl kdsjaflk ;sdjaflk ajdslfjalf jlkdsajf;l dasjf lk;dsjaf ljsadflk ajsfl;j asdlkf jadslf dsal;j flsaj";
//   call9.answers = [{
//     question: 'Did they provide x?',
//     answer: "sldfj kldsaf sad asjfksjaf ldsajfl;kdsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   },{
//     question: 'Did they provide y?',
//     answer: "sldfj kldasjfksjaf ldsajfl;kfdsaf sadf dsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   }],
//   call9.save(function(err){
//     console.log("Finished seeding call 9");
//   });
// var call10 = new Call();
//   call10.client = "56405a8d099e1364ad748e88";
//   call10.client_name = "Test client";
//   call10.agent = "56405a4b7b61d34cad2bd9f5";
//   call10.agent_name = "Test agent";
//   call10.duration = 23;
//   call10.campaign = "5640c95b7449cf4cbf024b1f";
//   call10.recording_url = "http://api.twilio.com/2010-04-01/Accounts/AC9e540d572431d3af66681b92102093ca/Recordings/REbfd32b0e53c0a0e57fa8f8eb05bd7b45";
//   // Data from the call
//   call10.contact_info = {
//     number: '0046532432455',
//     company: 'Crap company',
//     email: 'crappy@crap.com',
//     person: {
//       name: 'Crap McCrap',
//       role: 'CrapEO'
//     },
//   };
//   call10.lead_info = {
//     number: '00447547968608',
//     company: 'Tom\'s business',
//     address: 'Baltic quay',
//     email: 'tom@hotmail.com',
//     person: {
//       name: 'Tom Murray',
//       role: 'CTO'
//     },
//   };
//   call10.outcome = 'Do not call again';
//   call10.contact_name = 'Tom 2';
//   call10.rating = 1;
//   call10.notes = "dslkafj kldasjfl kdsjaflk ;sdjaflk ajdslfjalf jlkdsajf;l dasjf lk;dsjaf ljsadflk ajsfl;j asdlkf jadslf dsal;j flsaj";
//   call10.answers = [{
//     question: 'Did they provide x?',
//     answer: "sldfj kldsaf sad asjfksjaf ldsajfl;kdsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   },{
//     question: 'Did they provide y?',
//     answer: "sldfj kldasjfksjaf ldsajfl;kfdsaf sadf dsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   }],
//   call10.save(function(err){
//     console.log("Finished seeding call 10");
//   });
// var call11 = new Call();
//   call11.client = "56405a8d099e1364ad748e88";
//   call11.client_name = "Test client";
//   call11.agent = "56405a4b7b61d34cad2bd9f5";
//   call11.agent_name = "Test agent";
//   call11.duration = 23;
//   call11.campaign = "5640c95b7449cf4cbf024b1f";
//   call11.recording_url = "http://api.twilio.com/2010-04-01/Accounts/AC9e540d572431d3af66681b92102093ca/Recordings/REbfd32b0e53c0a0e57fa8f8eb05bd7b45";
//   // Data from the call
//   call11.contact_info = {
//     number: '0046532432455',
//     company: 'Crap company',
//     email: 'crappy@crap.com',
//     person: {
//       name: 'Crap McCrap',
//       role: 'CrapEO'
//     },
//   };
//   call11.lead_info = {
//     number: '00447547968608',
//     company: 'Tom\'s business',
//     address: 'Baltic quay',
//     email: 'tom@hotmail.com',
//     person: {
//       name: 'Tom Murray',
//       role: 'CTO'
//     },
//   };
//   call11.outcome = 'Unsuccessful';
//   call11.contact_name = 'Tom 2';
//   call11.rating = 1;
//   call11.notes = "dslkafj kldasjfl kdsjaflk ;sdjaflk ajdslfjalf jlkdsajf;l dasjf lk;dsjaf ljsadflk ajsfl;j asdlkf jadslf dsal;j flsaj";
//   call11.answers = [{
//     question: 'Did they provide x?',
//     answer: "sldfj kldsaf sad asjfksjaf ldsajfl;kdsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   },{
//     question: 'Did they provide y?',
//     answer: "sldfj kldasjfksjaf ldsajfl;kfdsaf sadf dsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   }],
//   call11.save(function(err){
//     console.log("Finished seeding call 11");
//   });
// var call12 = new Call();
//   call12.client = "56405a8d099e1364ad748e88";
//   call12.client_name = "Test client";
//   call12.agent = "56405a4b7b61d34cad2bd9f5";
//   call12.agent_name = "Test agent";
//   call12.duration = 23;
//   call12.campaign = "5640c95b7449cf4cbf024b1f";
//   call12.recording_url = "http://api.twilio.com/2010-04-01/Accounts/AC9e540d572431d3af66681b92102093ca/Recordings/REbfd32b0e53c0a0e57fa8f8eb05bd7b45";
//   // Data from the call
//   call12.contact_info = {
//     number: '0046532432455',
//     company: 'Crap company',
//     email: 'crappy@crap.com',
//     person: {
//       name: 'Crap McCrap',
//       role: 'CrapEO'
//     },
//   };
//   call12.lead_info = {
//     number: '00447547968608',
//     company: 'Tom\'s business',
//     address: 'Baltic quay',
//     email: 'tom@hotmail.com',
//     person: {
//       name: 'Tom Murray',
//       role: 'CTO'
//     },
//   };
//   call12.outcome = 'No answer';
//   call12.contact_name = 'Tom 2';
//   call12.rating = 1;
//   call12.notes = "dslkafj kldasjfl kdsjaflk ;sdjaflk ajdslfjalf jlkdsajf;l dasjf lk;dsjaf ljsadflk ajsfl;j asdlkf jadslf dsal;j flsaj";
//   call12.answers = [{
//     question: 'Did they provide x?',
//     answer: "sldfj kldsaf sad asjfksjaf ldsajfl;kdsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   },{
//     question: 'Did they provide y?',
//     answer: "sldfj kldasjfksjaf ldsajfl;kfdsaf sadf dsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   }],
//   call12.save(function(err){
//     console.log("Finished seeding call 12");
//   });
//   var call13 = new Call();
//   call13.client = "56405a8d099e1364ad748e88";
//   call13.client_name = "Test client";
//   call13.agent = "56405a4b7b61d34cad2bdr56";
//   call13.agent_name = "Test agent 2";
//   call13.duration = 23;
//   call13.campaign = "5640c95b7449cf4cbf024b1f";
//   call13.recording_url = "http://api.twilio.com/2010-04-01/Accounts/AC9e540d572431d3af66681b92102093ca/Recordings/REbfd32b0e53c0a0e57fa8f8eb05bd7b45";
//   // Data from the call
//   call13.contact_info = {
//     number: '0046532432455',
//     company: 'Crap company',
//     email: 'crappy@crap.com',
//     person: {
//       name: 'Crap McCrap',
//       role: 'CrapEO'
//     },
//   };
//   call13.lead_info = {
//     number: '00447547968608',
//     company: 'Tom\'s business',
//     address: 'Baltic quay',
//     email: 'tom@hotmail.com',
//     person: {
//       name: 'Tom Murray',
//       role: 'CTO'
//     },
//   };
//   call13.outcome = 'No answer';
//   call13.contact_name = 'Tom 2';
//   call13.rating = 1;
//   call13.notes = "dslkafj kldasjfl kdsjaflk ;sdjaflk ajdslfjalf jlkdsajf;l dasjf lk;dsjaf ljsadflk ajsfl;j asdlkf jadslf dsal;j flsaj";
//   call13.answers = [{
//     question: 'Did they provide x?',
//     answer: "sldfj kldsaf sad asjfksjaf ldsajfl;kdsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   },{
//     question: 'Did they provide y?',
//     answer: "sldfj kldasjfksjaf ldsajfl;kfdsaf sadf dsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   }],
//   call13.save(function(err){
//     console.log("Finished seeding call 13");
//   });
//   var call14 = new Call();
//   call14.client = "56405a8d099e1364ad748e88";
//   call14.client_name = "Test client";
//   call14.agent = "56405a4b7b61d34cad2bdr56";
//   call14.agent_name = "Test agent 2";
//   call14.duration = 23;
//   call14.campaign = "5640c95b7449cf4cbf024b1f";
//   call14.recording_url = "http://api.twilio.com/2010-04-01/Accounts/AC9e540d572431d3af66681b92102093ca/Recordings/REbfd32b0e53c0a0e57fa8f8eb05bd7b45";
//   // Data from the call
//   call14.contact_info = {
//     number: '0046532432455',
//     company: 'Crap company',
//     email: 'crappy@crap.com',
//     person: {
//       name: 'Crap McCrap',
//       role: 'CrapEO'
//     },
//   };
//   call14.lead_info = {
//     number: '00447547968608',
//     company: 'Tom\'s business',
//     address: 'Baltic quay',
//     email: 'tom@hotmail.com',
//     person: {
//       name: 'Tom Murray',
//       role: 'CTO'
//     },
//   };
//   call14.outcome = 'No answer';
//   call14.contact_name = 'Tom 2';
//   call14.rating = 1;
//   call14.notes = "dslkafj kldasjfl kdsjaflk ;sdjaflk ajdslfjalf jlkdsajf;l dasjf lk;dsjaf ljsadflk ajsfl;j asdlkf jadslf dsal;j flsaj";
//   call14.answers = [{
//     question: 'Did they provide x?',
//     answer: "sldfj kldsaf sad asjfksjaf ldsajfl;kdsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   },{
//     question: 'Did they provide y?',
//     answer: "sldfj kldasjfksjaf ldsajfl;kfdsaf sadf dsajflksdajflkdjs af askfjasdl kfjsakd jfskla."
//   }],
//   call14.save(function(err){
//     console.log("Finished seeding call 14");
//   });

// });