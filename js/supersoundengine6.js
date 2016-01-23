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



			 			audioGain = self.context.createGain();
        				audioGain.gain.value = 1;
        				audioGain.connect(self.context.destination);

						// Connect the source node to the Web Audio destination node
						self.source.connect( self.context.destination ); 
						// Add an EventListener to fire a function every time a key is pressed
						
						/* Init tiny metronome */
						/* This regulates the playback queuing of individual segments */
						self.initMetronome();
						
						/* Init big metronome */
						/* This regulates the queuing of bars, structures  */
						/*self.bigMetronome.init(self);
						self.bigMetronome.start();*/
						


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
		bufferQueue: [], // only necessary to keep track of what to stop

		play: function (seg){
			//console.log("play", seg);
			//when, start, duration, segment_id, callback_onended, gain, layer
			// Create a new BufferSource
			newSource = this.context.createBufferSource();

			//console.log("1+++",newSource, "++++",newSource.buffer)

			// Copy the buffer data from the loaded sound
			newSource.buffer = this.source.buffer;
			// Connect the new source to the new destination


			//console.log("2+++",newSource, "++++",newSource.buffer)

			if(seg.gain==0){
				gainNode = this.context.createGain();
				gainNode.gain.value = 0
				newSource.connect(gainNode)
				gainNode.connect( this.context.destination );
			}else{
				newSource.connect( this.context.destination );
			}
		
			newSource.beginTime = seg.when + this.context.currentTime;
			newSource.layer = seg.layer;
			//	console.log(layer, newSource.layer);

			newSource.start( newSource.beginTime, seg.start, seg.duration);
			//newSource.onended = callback_onended;

			/*if(seg.callback_onended != null){
				newSource.onended = function(){
					if(this.context.currentTime >= this.beginTime){
						callback_onended(seg.segment_id, song);
					}
				}
			}*/
			
			this.bufferQueue.push(newSource)
		},

		/*
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
			
		},*/

		stopAll: function(w){
			console.log("stopAll")
			$.each(this.bufferQueue, function(k,v){
					v.stop(w + this.context.currentTime);
			})
			this.bufferQueue = []
		},

		stopLayer: function (w, layer){
			console.log("stopLayer", layer)
			$.each(this.bufferQueue, function(k,v){
				//console.log(v.layer);
				if(v.layer == layer){
					v.stop(w + this.context.currentTime);
				}
			})
			//console.log("playqueue before", layer, this.playQueue)
			this.bufferQueue = this.bufferQueue.filter(function(v){return v.layer!=layer})
			//console.log("playqueue after", this.playqueue, "\n")
		},

		timerWorker: null,
		interval: 25,
		windowLength: 0.1, // How far ahead to schedule audio (sec)

		initMetronome: function(){
			console.log("metronome init")
			this.timerWorker = new Worker("js/metronomeworker.js");
			var self = this;
			this.timerWorker.onmessage = function(e) {
		        if (e.data == "tick") {
		            console.log("tick!");
		            self.segmentScheduler();
		        }else{
		            console.log("message: " + e.data);
		        }
			};
			this.setTimerInterval(this.interval);
			this.startMetronome();
		},
		startMetronome: function(){
			console.log("metronome start")
			if(this.timerWorker!==null){
				this.timerWorker.postMessage("start")
			}
		},
		stopMetronome: function(){
			console.log("Metronome stop")
			if(this.timerWorker!==null){
				this.timerWorker.postMessage("stop")
			}
		},
		setTimerInterval: function(){
			if(this.timerWorker!==null){
			    this.timerWorker.postMessage({"interval": this.interval});
			}
		},


        segmentQueue : [], //// segments that have been put into the queue,
                            // and may or may not have played yet. {when, start, duration, segment_id, callback_onended, gain, layer}

        queueSegment: function(seg){
        	//console.log("queue", seg, this)
        	this.segmentQueue.push(seg);
        },

		segmentScheduler: function(){
			//console.log("scheduler", this)
		    // while there are segments that will need to play before the next interval, 
		    // schedule them and advance the pointer.
		    while((this.segmentQueue.length > 0) 
		    	&& (this.segmentQueue[0].when < this.context.currentTime + this.windowLength)){
		    	this.play(this.segmentQueue.shift());
		    }
		},

		/* BAR scheduler? */ 


		/*
		// Jump immediately to a new bar, and remove all other queued bars and segments
		// New Bar
		newBar: function(bar){
			// length(sec), loop(true/false), listOfSegs, gain(0.0-1.0)
			barQueue = [];
			segmentQueue = [];
			stopAll();
			//bigMetronome.setInterval(bar.length * 0.9);
			//barQueue.push(bar);
			queueBar(bar, 0, 0)

		}

		// Jump immediately to a new bar, at the same point in the bar
		legatoBar: function(bar){
			// get position
			segmentQueue = [];
			// stop old bar
			stopAll();
			barQueue = [];

			currentPosition = oldbarPosition % bar.length;
			
			// start playing new bar
			queueBar(bar, currentPosition, 0)

		}

        bigMetronome: new Metronome(200, function(){this.barScheduler}),

        barQueue: [], // list of bars

        queueBar: function(bar, barPosition, barWhen){
        	// length, loops, listOfSegs, gain

        	var pos = 0, offset = 0, seg, s = 0;
        	//this.barQueue.push(bar);
        	while(pos < bar.length && s < bar.listOfSegs.length){
        		seg = bar.listOfSegs[s];
        		if(pos + seg.duration >= barPosition){
        			// This segment should be queued
        			offset = (pos<barPosition) ? (barPosition-pos) : 0;
        			this.queueSegment({
	        			when: s.when + barWhen,
	        			start: s.start + offset,
	        			duration: s.duration - offset,
	        			segment_id: s.segment_id,
	        			gain: s.gain * bar.gain,
	        			layer: s.layer,
	        			callback_onended: s.callback_onended
	        		})
        		}
        		pos += seg.duration;
        		s++;
        		if(bar.loops) s %= listOfSegs.length;
        	}
        },

        barScheduler: function(){
        	for(var bar in barQueue){
        		queueBar(bar, 0, );
        	}
		    	//&& (this.barQueue[0].when < this.context.currentTime + this.bigMetronome.windowLength)){
        }
		*/
		/*
		barQueue examples
		[play this bar then stop]
		[loop this bar forever]
		[finish this bar then, play this bar then stop]
		[finish this bar then, loop this bar forever]
		[wait for next segment, then jump to next loop]
		[jump to next loop now in legato mode]
		[chaos loop ask supersong for next loop]
		[probabilistic loop ask supersong for next loop]

		*/

        

	}
};

	




  