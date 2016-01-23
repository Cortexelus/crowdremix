
function Loop (songs_used, tempo, steps, pulses, playhead_selections, palette_selections, play_segment_list, chaos, flows ,forever, layer){
	this.songs_used = songs_used
	this.tempo = tempo
	this.steps = steps
	this.pulses = pulses
	this.playhead_selections = playhead_selections
	this.palette_selections = palette_selections
	this.play_segment_list = play_segment_list
	this.chaos = chaos
	this.flows = flows
	this.forever = forever
	this.layer = layer

	this.fat_segments = true
    this.auto_shuffle = true

    this.all_sounds_loaded = function(){
    	return this.songs_used.reduce(function(p,c,i,a){ p && c.sounds_loaded; })
    }

   	// zero-size selection bug fix
	this.removeZeroSizeSelections = function (){
		this.playhead_selections = this.playhead_selections.filter(function(e){return e.length>0;})
		this.palette_selections = this.palette_selections.filter(function(e){return e.length>0;})
	}

	this.json_loop = function(){
		var tmp_song = this.song;
		this.song = null;
		var jsonstring = JSON.stringify(this);
		this.song = tmp_song;
		return jsonstring;
	}

    this.draw_key = function(song, key_id){

		gradient = []
		p = 0 // position in percent
		for(var s=0;s<this.play_segment_list.length;s++){
			step_length = this.play_segment_list[s].step_length;
			percent_length = step_length / this.steps * 100
			segment_id = this.play_segment_list[s].segment_id;
			hue = song.palette_hues[song.palette_segments.indexOf(segment_id)]

			c1 = rgbCode(hslToRgb(hue, 1.0, 0.7))
			c2 = rgbCode(hslToRgb(hue, 1.0, 0.85))
			//console.log(hue, play_segment_list, play_segment_list[s], play_segment_list[s].segment_id, _song.palette_segments.indexOf(play_segment_list[s].segment_id))
			gradient.push(c1+' '+p+'%');
			gradient.push(c2+' '+(p+percent_length)+'%');
			p+=percent_length;
		}

		gradient = gradient.join(',');

		//console.log("key_id",key_id)
		//console.log("$",$(key_id))
		//console.log("gradient","background-image","linear-gradient(to right, "+gradient+")")
		$(key_id).css("background-image","linear-gradient(to right, "+gradient+")")

		if(this.layer == "on earth") bordertype = "2px dotted";
		else if(this.layer == "on neptune") bordertype = "2px dashed";
		else bordertype = "2px outset"
		$(key_id).css("border",bordertype)

	}

	// take a loop, export as WAV file
    this.export_wav = function(){
    	console.log("exporting wav", this)
    	this.get_samples(function(buffer){
    		var interleaved = interleave(buffer.getChannelData(0), buffer.getChannelData(1))
    		var dataview = encodeWAV(interleaved);
			var audioBlob = new Blob([dataview], { type: 'audio/wav' });
			forceDownload(audioBlob, "cr_floop.wav");
    	})
    }

	this.get_samples = function(callback){
		//console.log("play_segment_list", this.play_segment_list)
		var then = 0;
		var extra_seconds = 0;
		if(this.chaos == "chaos"){
			num_loops = 8; // do a few copies of the loop on export
		}else{
			num_loops = 1;
		}
		if(this.forever == "and so on"){
			extra_seconds = 5;
		}

		var total_duration = 60 / this.tempo

		var offline = new webkitOfflineAudioContext(song.sound.source.buffer.numberOfChannels,
			(total_duration*num_loops + extra_seconds)*song.sound.source.buffer.sampleRate,
			song.sound.source.buffer.sampleRate)
		
		console.log(num_loops);
		for(var loops=0;loops<num_loops;loops++){
			for(var s=0;s<this.play_segment_list.length;s++){
				if(this.chaos == "chaos"){
					segment_id = song.from_palette("all");
				}else{
					segment_id = this.play_segment_list[s].segment_id
				}
				segment = song.segments[segment_id]

				step_duration =  60 / this.tempo / this.steps * this.play_segment_list[s].step_length;
				loop_buffer = offline.createBufferSource();
				loop_buffer.buffer = song.sound.source.buffer;
				loop_buffer.connect(offline.destination);

				if(this.flows == "flows"){
					loop_buffer.start(then, segment.start, step_duration );
				}else{
					loop_buffer.start(then, segment.start, segment.duration )
				}
				
				//console.log(then, segment, segment_id ,step_duration, loop_buffer)
				then += step_duration

			}

		}
		if(this.forever == "and so on"){
			loop_buffer.start(then, segment.start + segment.duration, extra_seconds) // add 4 seconds of the original song at the end
		}

		offline.startRendering();
		offline.oncomplete = function( ev ){
		  console.log("complete", ev);
		  callback(ev.renderedBuffer);
		}
		console.log("rendering..")
	
	}
}

