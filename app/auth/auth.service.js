'use strict';

var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/environment');
// var jwt = require('jsonwebtoken');
// var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var Agent = require('../api/agent/agent.model');
var Admin = require('../api/admin/admin.model');
var Client = require('../api/client/client.model');
var Q = require('q');
// var validateJwt = expressJwt({
//   secret: config.secrets.session
// });

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */

// function isAuthenticated(){
//   return compose()
//     // Validate jwt
//     .use(function(req, res, next) {
//       // allow access_token to be passed through query parameter as well
//       if (!req.isAuthenticated()){
//         // return res.status(401).send('Unauthorized');
//         req.session.blocked_path = req.url;
//         console.log("Setting path: ", req.session.blocked_path);
//         // return res.status(401).render(config.root + '/public/assets/errors/unauthorized');
//         return res.redirect('/');
//       }
//       return next();
//     })
// };

function hasRole(user,roleRequired) {
  if (!roleRequired)
    throw new Error('Required role needs to be set');
  if(roleRequired == 'agent')
    return isAgent(user);
  if(roleRequired == 'client')
    return isClient(user);
  if(roleRequired == 'admin')
    return isAdmin(user);
  throw new Error('Required role needs to be set correctly');
  // return res.status(403).render(config.root + '/public/assets/errors/forbidden');
  // return res.redirect('/');
}

/**
 * Checks if the user role meets the minimum requirements of the route is middleware
 */

function isAgent(user){
    var deferred = Q.defer();
    Agent.findById(user._id, function(err,agent){
      if(err){deferred.reject('0')}
      if(!agent){deferred.reject('0')}
      deferred.resolve(agent);
    })
    return deferred.promise
}
function isClient(user){
    var deferred = Q.defer();
    Client.findById(user._id, function(err,client){
      if(err){deferred.reject('0')}
      if(!client){deferred.reject('0')}
      deferred.resolve(client);
    })
    return deferred.promise
}
function isAdmin(user){
    var deferred = Q.defer();
    Admin.findById(user._id, function(err,admin){
      if(err){deferred.reject('0')}
      if(!admin){deferred.reject('0')}
      deferred.resolve(admin);
    })
    return deferred.promise
}

// function hasRole(roleRequired) {
//   if (!roleRequired)
//     throw new Error('Required role needs to be set');
//   if(roleRequired == 'agent')
//     return isAgent();
//   if(roleRequired == 'client')
//     return isClient();
//   if(roleRequired == 'admin')
//     return isAdmin();
//   // return res.status(403).send('Forbidden');
//   // return res.status(403).render(config.root + '/public/assets/errors/forbidden');
//   return res.redirect('/');
// }

// function isAgent() {

//   return compose()
//     .use(isAuthenticated())
//     .use(function meetsRequirements(req, res, next) {
//       Agent.findById(req.user._id,function(err,agent){
//         if (err) {
//           req.session.blocked_path = req.url;
//           console.log("Setting path: ", req.session.blocked_path);
//           return next(err);
//         }
//         if (!agent) {
//           req.session.blocked_path = req.url;
//           console.log("Setting path: ", req.session.blocked_path);
//           // return res.status(403).render(config.root + '/public/assets/errors/forbidden');
//           return res.redirect('/');
//         }
//         next();
//       });
//     });
// }

// function isClient() {

//   return compose()
//     .use(isAuthenticated())
//     .use(function meetsRequirements(req, res, next) {
//       Client.findById(req.user._id,function(err,client){
//         if (err) {
//           req.session.blocked_path = req.url;
//           return next(err);
//         }
//         if (!client) {
//           req.session.blocked_path = req.url;
//           // return res.status(403).render(config.root + '/public/assets/errors/forbidden');
//           return res.redirect('/');
//         }
//         next();
//       });
//     });
// }

// function isAdmin() {

//   return compose()
//     .use(isAuthenticated())
//     .use(function meetsRequirements(req, res, next) {
//       Admin.findById(req.user._id,function(err,admin){
//         if (err) {
//           req.session.blocked_path = req.url;
//           return next(err);
//         }
//         if (!admin) {
//           req.session.blocked_path = req.url;
//           // return res.status(403).render(config.root + '/public/assets/errors/forbidden');
//           return res.redirect('/');
//         }
//         next();
//       });
//     });
// }

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id) {
  return jwt.sign({ _id: id }, config.secrets.session, { expiresInMinutes: 60*5 });
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  if (!req.user) return res.status(404).json({ message: 'Something went wrong, please try again.'});
  var token = signToken(req.user._id);
  res.cookie('token', JSON.stringify(token));
  res.redirect('/');
}

// exports.isAuthenticated = isAuthenticated;
exports.hasRole = hasRole;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;