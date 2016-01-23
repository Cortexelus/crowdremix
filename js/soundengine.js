/*
 * Low-Latency Playback: From User Input
 * Web Audio API Demo
 * http://www.w3.org/2011/audio/
 * -- F1LT3R
 */
 

function load_sound(mp3, callback){
	return {
		// Create the Web Audio context
		cool: "d",
		context: {},
		// Create a bufferSource object to store the audio data
		source: {},
		init: function(){
			this.context = new webkitAudioContext();
			this.source = this.context.createBufferSource();
			var self = this;
			var request = new XMLHttpRequest();
			
			// Create an XHR object to fetch the sound-file from the server
			//this.request = new XMLHttpRequest();
			// Make an EventListener to handle the sound-file after it has been loaded
			request.addEventListener( 'load', function( e ){
				// Beginning decoding the audio data from loaded sound-file ...
				
				
				self.context.decodeAudioData( request.response, function( decoded_data ){ 
						
						// Store the decoded buffer data in the source object
						self.source.buffer = decoded_data; 



			 			audioGain = self.context.createGainNode();
        				audioGain.gain.value = 1;
        				audioGain.connect(self.context.destination);

						// Connect the source node to the Web Audio destination node
						self.source.connect( self.context.destination ); 
						// Add an EventListener to fire a function every time a key is pressed
						
						
						
						callback();  
					// Handle any decoding errors
					}, function( e ){ console.log( e ); } 
				// End of decode handler
				); 
				// End of Event Listener
				}, false );

			request.onerror = function(e) {
                console.log("error",e)
            }

			// Point the request to the sound-file that you want to play
			request.open( 'GET', mp3, true );
			// Set the XHR response-type to 'arraybuffer' to store binary data
			request.responseType = "arraybuffer";
			// Begin requesting the sound-file from the server
			request.send();


			
		},
		playQueue: [],

		play: function (when, start, duration){

			// Create a new BufferSource
			newSource = this.context.createBufferSource();
			// Copy the buffer data from the loaded sound
			newSource.buffer = this.source.buffer;
			// Connect the new source to the new destination
			newSource.connect( this.context.destination );
			// Play the sound immediately
			
			newSource.start( when + this.context.currentTime, start, duration );

			this.playQueue.push(newSource)
		},

		playFinal: function(when,start,duration,callback){
			// Create a new BufferSource
			newSource = this.context.createBufferSource();
			// Copy the buffer data from the loaded sound
			newSource.buffer = this.source.buffer;
			// Connect the new source to the new destination
			newSource.connect( this.context.destination );
			// Play the sound immediately
			newSource.onended = callback
			
			newSource.start( when + this.context.currentTime, start, duration );

			this.playQueue.push(newSource)
			
		},

		stopAll: function(w){
			
			$.each(this.playQueue, function(k,v){
				v.stop(w + this.context.currentTime);
			})
			this.playQueue = []
		}




		
	}
};




  