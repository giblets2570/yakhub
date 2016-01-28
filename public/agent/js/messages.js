/**
* messagesApp Module
*
* Description the messages module that controls the messaging part of the site.
*/
angular.module('messagesApp', ['btford.socket-io','navbarApp','luegg.directives','ngSanitize','textAngular'])

// The factory required for sockets to work.
.factory('socket', function (socketFactory) {
  return socketFactory();
})

.controller('messagesCtrl', function($scope,$location,$filter,Message,Client,Agent,socket){
	// This valued makes the div containing the messages remain scrolled to the bottom.
	$scope.glued = true;
	// This is the toolbar that will appear with the messages.
	$scope.toolbar = [
      [],
      [],
      [],
      []
  	];
  	$scope.orderedChats = [];
	// This gets the messages/chats that the agent is in.
	$scope.getMessages = function(c){
		Message.get({},'clients agents name last_message messages').then(function(data){
			$scope.chats = data;
			$scope.orderedChats = $filter('messageOrderer')($scope.chats);
			c();
		})
	};
	// Function that choose the chat that is active. Need a way to show this is the UI.
	$scope.chooseChat = function(chat){
		console.log(chat);
		$scope.chat = chat;
	}
	// Get's the data for the current agent. Required for constructing new messages.
	$scope.getAgent = function(c){
		Agent.me({},'name').then(function(data){
			$scope.agent = data;
			c();
		})
	}
	// Alerts the backend that all messages are seen
	$scope.seenMessages = function(){
		Agent.update({new_messages: false},$scope.agent._id);
	}
	// Toggles whether the agent is editing the name of the chat or not.
	$scope.editName = function(){
		$scope.edit_name = !$scope.edit_name;
	}
	// Save the new name for the chat.
	$scope.saveName = function(){
		$scope.edit_name = !$scope.edit_name;
		Message.update({name: $scope.chat.name}, $scope.chat._id).then(function(data){
			console.log(data);
		})
	}
	// Function that finds the name of the chat to display on the left side column.
	// If their is no chat name, then the names of the people in the chat will be
	// the placeholder name.
	$scope.getName = function(chat){
		if(!chat) return '';
		if(chat.name) return chat.name;
		var result = '';
		for (var i = 0; i < chat.clients.length; i++)
			result!='' ? result+=', '+chat.clients[i].client_name : result+=chat.clients[i].client_name;
		for (var i = 0; i < chat.agents.length; i++)
			result!='' ? result+=', '+chat.agents[i].agent_name : result+=chat.agents[i].agent_name;
		return result;
	};
	// Returns the last message date for the chat to appear on the left.
	$scope.lastDate = function(chat){
		if(!chat.last_message) return '';
		if (typeof chat.last_message !== 'object') chat.last_message = new Date(chat.last_message);
		var result = chat.last_message.getDate() + '/' + (chat.last_message.getMonth()+1) + '/' + chat.last_message.getFullYear()+", "+chat.last_message.getHours() +":";
		var minutes = chat.last_message.getMinutes().toString();
		if(minutes.length == 1)
			minutes = '0'+minutes;
		return result+minutes;
	};

	// Function that send's the message. First is attaches the message to the client side,
	// then it send's it to the server.
	$scope.sendMessage = function(message){
		if(!$scope.chat){return;}
		if(!message){message=$scope.newMessage}
		$scope.chat.last_message = new Date();
		$scope.chat.messages.push({
			user_type: 'agent',
			agent: $scope.agent._id,
			agent_name: $scope.agent.name,
			text: message
		});
		// Clears the message field
		$scope.newMessage = '';
		// This makes sure that the message box is scrolled all the way to
		// the bottom when the new message is made.
		$scope.glued = true;
		Message.update({messages: $scope.chat.messages}, $scope.chat._id).then(function(data){
			console.log(data);
		});
		for (var i = $scope.chat.clients.length - 1; i >= 0; i--) {
			Client.update({new_messages: true},$scope.chat.clients[i].client);
		};
		for (var i = $scope.chat.agents.length - 1; i >= 0; i--) {
			if($scope.chat.agents[i].agent.toString() != $scope.agent._id.toString()) continue;
			Agent.update({new_messages: true},$scope.chat.agents[i].agent);
		};
	}
	// Function that sends a file accross the messages.
	$scope.sendFile = function(file){
		Message.sendFile(file).then(function(data){
			var filename = data.config.data.file.name;
			var uploaded_filename = data.config.url + data.config.data.key;
			var message = '<a href="' + uploaded_filename + '" target="_blank"> ' + filename + ' </a>';
			$scope.sendMessage(message);
		})
	}
	// Find's you send the message.
	$scope.getMessageSender = function(message){
		if(message.user_type == 'client') return $scope.client && message.client_name == $scope.client.name ? 'You' : message.client_name;
		if(message.user_type == 'agent') return $scope.agent && message.agent_name == $scope.agent.name ? 'You' : message.agent_name;
	}
	$scope.chatChosen = function(chat){
		return $scope.chat && chat && $scope.chat._id == chat._id ? 'background: #DBFAB9;' : '';
	}
	// Funciton that's called when the page loads. Some asycronous callbacks
	// to make sure that the correct things are gotten in the right order.
	$scope.init = function(){
		$scope.getAgent(function(){
			$scope.getMessages(function(){
				$scope.chooseRecentChat();
				console.log($scope.chat);
			})
			$scope.seenMessages();
		});
	};
	$scope.chooseRecentChat = function(){
		console.log("Here");
		var recent = -1, index = -1;
		for (var i = $scope.chats.length - 1; i >= 0; i--) {
			var k = (new Date($scope.chats[i].last_message)).valueOf();
			console.log(k, $scope.chats[i].name, k > recent);
			if(k > recent){
				recent = k;
				index = i;
			}
		};
		console.log(index);
		console.log($scope.chats[index]);
		if(index > -1){
			$scope.chat = $scope.chats[index]
		}else{
			if($scope.chats.length > 0){
				$scope.chat = $scope.chats[0];
			}
		}
	}
	// The socket listener. It listens for messages that have been save on the server.
	// When it receives the message, it checks if it has on of the chats that have a new message,
	// and if it does, it will replace it. I have no idea how things like facebook implement
	// this, redis or some shizz.
	socket.on('message:save', function(data){
		for (var i = $scope.chats.length - 1; i >= 0; i--) {
			if($scope.chats[i]._id == data._id){
				$scope.chats[i].messages = data.messages;
				break
			}
		};
	})
})

.filter('messageOrderer', function(){
	return function(input){
		if(!input) return input;
		input.sort(function(a, b){
			if(!a.last_message || b.last_message>=a.last_message)
				return 1;
			if(!b.last_message || a.last_message>b.last_message)
				return -1;
		});
		return input;
	}
})

.directive('compile', function ($compile) {
  return function(scope, element, attrs) {
    scope.$watch(
      function(scope) {
        // watch the 'compile' expression for changes
        return scope.$eval(attrs.compile);
      },
      function(value) {
        // when the 'compile' expression changes
        // assign it into the current DOM
        element.html(value);

        // compile the new DOM and link it to the current
        // scope.
        // NOTE: we only compile .childNodes so that
        // we don't get into infinite loop compiling ourselves
        $compile(element.contents())(scope);
      }
    );
  };
});