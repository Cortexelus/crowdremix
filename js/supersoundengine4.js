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
		request: new XMLHttpRequest(),
		init: function(){
			this.context = new webkitAudioContext();
			this.source = this.context.createBufferSource();
			var self = this;
			
			// Create an XHR object to fetch the sound-file from the server
			//this.request = new XMLHttpRequest();
			// Make an EventListener to handle the sound-file after it has been loaded
			this.request.addEventListener( 'load', function( e ){
				// Beginning decoding the audio data from loaded sound-file ...
				
				
				self.context.decodeAudioData( self.request.response, function( decoded_data ){ 
						
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

			this.request.onerror = function(e) {
                console.log("error",e)
            }

			// Point the request to the sound-file that you want to play
			this.request.open( 'GET', mp3, true );
			// Set the XHR response-type to 'arraybuffer' to store binary data
			this.request.responseType = "arraybuffer";
			// Begin requesting the sound-file from the server
			this.request.send();


			
		},
		playQueue: [], // only necessary to keep track of what to stop

		play: function (when, start, duration, segment_id, callback_onended, gain, layer){

			// Create a new BufferSource
			newSource = this.context.createBufferSource();

			//console.log("1+++",newSource, "++++",newSource.buffer)

			// Copy the buffer data from the loaded sound
			newSource.buffer = this.source.buffer;
			// Connect the new source to the new destination


			//console.log("2+++",newSource, "++++",newSource.buffer)

			if(gain==0){
				gainNode = this.context.createGain();
				gainNode.gain.value = 0
				newSource.connect(gainNode)
				gainNode.connect( this.context.destination );
			}else{
				newSource.connect( this.context.destination );
			}
		
			newSource.beginTime = when + this.context.currentTime;
			newSource.layer = layer;
			//	console.log(layer, newSource.layer);

			newSource.start( newSource.beginTime, start, duration);
			//newSource.onended = callback_onended;

			if(callback_onended != null){
				newSource.onended = function(){
					if(this.context.currentTime >= this.beginTime){
						callback_onended(segment_id, song);
					}
				}
			}
			
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
			//console.log("stopAll")
			$.each(this.playQueue, function(k,v){
					v.stop(w + this.context.currentTime);
			})
			this.playQueue = []
		},

		stopLayer: function (w, layer){
			$.each(this.playQueue, function(k,v){
				//console.log(v.layer);
				if(v.layer == layer){
					v.stop(w + this.context.currentTime);
				}
			})
			//console.log("playqueue before", layer, this.playQueue)
			this.playQueue = this.playQueue.filter(function(v){return v.layer!=layer})
			//console.log("playqueue after", this.playqueue, "\n")
		}





		
	}
};




  