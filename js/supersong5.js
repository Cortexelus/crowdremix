// object associated with a single mp3, its analysis, its interface objects, and its sound control
function SongSound(id, mp3, jsonfilename, song_title, artist, segments, palette){
	this.song_id = id
    this.mp3 = mp3
    this.song_title = song_title
    this.artist = artist
    this.segments = segments
    this.palette = palette
    this.palette_segments = palette.segment_ids
    this.palette_hues = palette.hues

    this.num_channels = 2
   	this.sample_rate = 44100
   	this.loudness_info = false

    this.number_of_palette_selections = 1
    this.sound_loaded = false; // flag, turns true when mp3 is loaded

    var _song = this;

    this.soundbuffer = null;


    this.init = function(){
	    this.playhead = new Playhead("playhead", "playhead-highlight", this)
	   	this.palette_mapper = new PaletteMapper("palette-mapper", "palette-mapper-highlight", this)

	   	this.soundbuffer = loadSoundBuffer(this.mp3);

	    $("#artist-name").html(artist)
	    $("#song-title").html(song_title)
	}
 


	// highlight segments in both the palette_mapper and the playhead
	// set one of these arguments as a list of ints, and the other as null, and it will figure out what to highlight
	this.highlight_all = function (segment_ids, palette_indices){
		//console.log("highlight_all", segment_ids, palette_indices)
		if(palette_indices == null){
			palette_indices = [];
		}
		if(segment_ids == null){
			segment_ids = [];
		}
	
		segment_ids = segment_ids.concat(flatten(this.playhead_selections))
		palette_indices = palette_indices.concat(flatten(this.palette_selections))
	
		segment_ids = unique(segment_ids)
		palette_indices = unique(palette_indices)

		this.playhead.highlight(segment_ids)
		this.palette_mapper.highlight(palette_indices)

	}


	this.loadSoundBuffer = function(){
		var soundbuffer = new SoundBuffer(this, this.mp3, function(){
			console.log("Finished loading MP3");
			this.sound_loaded = true
			$("#loading-audio").hide();
			$("#playhead-and-palette").show();
			console.log("savedLoops", savedLoops)
			if(Object.keys(savedLoops).length>0){
				$(".keyboard").show();
			}
		});
		soundbuffer.init();
		this.soundbuffer = soundbuffer;
	}

}

// object associated with a sound layer
function LoopStation(layername){
	this.loop = new Loop(); // the current settings
	this.layername = layername; // in space, on earth, on neptune, etc
	var _station = this;
	var _cr = CrowdRemix;
	var songs = CrowdRemix.songs; 

	this.rhythm_display = new RhythmDisplay("rhythm-display")

	// call this function whenever the parameters change
	this.update_rhythm = function(keep_old_segments){
		pattern = bjorklund(this.loop.steps, this.loop.pulses)
		old_segment_list = this.loop.play_segment_list;
		os = 0; // counter for old_segment_list
		play_segment_list = []
		for(var p=0;p<pattern.length;p++){
        	if(this.loop.fat_segments && pattern[p]==0){
           		play_segment_list[play_segment_list.length-1]["step_length"]++
           		if(this.loop.palette_selections.length>1){
           			//play_segment_list[play_segment_list.length-1]["segment_id"] = this.from_palette(1)
           		}
        	}else{
        		if(!this.loop.fat_segments && (this.loop.palette_selections.length+this.loop.playhead_selections.length) > 1) {
        			if(keep_old_segments && os<old_segment_list.length){
        				new_segment_id = old_segment_list[os].segment_id
        				os++
        			}else{
        				new_segment_id = this.from_palette(pattern[p]) // two or more selections? pick according to euclidean
        			}
        		}else{
        			if(keep_old_segments && os<old_segment_list.length){
        				new_segment_id = old_segment_list[os].segment_id
        				os++
        			}else{
        				new_segment_id = this.from_palette("all"); // else pick from the whole selection
        			}
        		}
        		seg = {"segment_id": new_segment_id, "step_length": 1}
        		
        		play_segment_list.push(seg)
        	}
		}
		this.loop.play_segment_list = play_segment_list
		this.rhythm_display.draw(this.loop.steps, play_segment_list)

	}

    this.rhythmChange = function() {
      this.loop.steps = step_slider.getValue()
      this.loop.pulses = pulse_slider.getValue()
      if(this.loop.pulses> this.loop.steps){
          this.loop.pulses = this.loop.steps;
          $('#pulse_slider').slider({max: this.loop.steps})
      }

      
      var value = $('#pulse_slider').data('slider').getValue();
      if(!(this.loop.steps == 1 && this.loop.pulses == 1)) $('#pulse_slider').data('slider').max = this.loop.steps;
      $('#pulse_slider').slider('setValue', value);
      $('#GC').attr("style","width: "+(100 * (this.loop.steps-1)/16)+"%");
	  
    };

    this.tempoChange = function(){
        this.loop.tempo = log_tempo(tempo_slider.getValue())
        $("#ui-tempo").html(this.loop.tempo + " bpm")
    }


    var step_slider = $('#step_slider').slider()
            .on('slide', function(){_station.rhythmChange(); _station.update_rhythm(true)})
            .on('mouseup', function(){ _station.play_list(_station.loop.play_segment_list) })
            .data('slider');
    var pulse_slider = $('#pulse_slider').slider()
            .on('slide', function(){_station.rhythmChange(); _station.update_rhythm(true)})
            .on('mouseup', function(){ _station.play_list(_station.loop.play_segment_list) })
            .data('slider');
    var tempo_slider = $('#tempo_slider').slider()
            .on('slide', function(){_station.tempoChange(); _station.update_rhythm(true)})
            .on('mouseup', function(){ _station.play_list(_station.loop.play_segment_list) })
            .data('slider');


	// pallete_selections and playhead_selections should return a list of psegment_id:
	// [[palette_id, segment_id]..]
	// grabs a segment from all your selections
	this.from_palette = function(selection_id){
		//console.log("from_palette",selection_id)
		if(selection_id=="all"){
			pal = flatten(this.loop.palette_selections)
			play = flatten(this.loop.playhead_selections)
			//console.log("pal",pal,this.palette_selections, "play",play, this.playhead_selections)
			if(play.length>0 && pal.length==0){
				// if only playhead selections, pick from playhead
				ps = this.loop.playhead_selections[Math.floor(Math.random()*this.loop.playhead_selections.length)];
				psegment_id = ps[Math.floor(Math.random()*ps.length)]
				//console.log(" pick from palyhead",ps,segment_id)
			}else if(pal.length>0 && play.length==0){
				// if only palette selections, pick from palette
				ps = this.loop.palette_selections[Math.floor(Math.random()*this.loop.palette_selections.length)];
				palette_index = ps[Math.floor(Math.random()*ps.length)]
				song = songs[palette_index[0]]
				segment_id = song.palette_segments[palette_index[1]]
				psegment_id = [palette_index[0], segment_id]
				//console.log(" pick from palette",ps,palette_index,segment_id)
			}else{
				// if both selections, pick from a random selection
				total_selections = this.loop.palette_selections.length + this.loop.playhead_selections.length;
				if(Math.random() * total_selections <= this.loop.palette_selections.length){ // randomly pick from palette or playhead
					// pick from palette
					ps = this.loop.palette_selections[Math.floor(Math.random()*this.loop.palette_selections.length)];
					palette_index = ps[Math.floor(Math.random()*ps.length)]
					song = songs[palette_index[0]]
					segment_id = song.palette_segments[palette_index[1]]
					psegment_id = [palette_index[0], segment_id]
					//console.log("random pick from palette",ps,palette_index,segment_id)
				}else{
					// pick from playhead
					ps = this.loop.playhead_selections[Math.floor(Math.random()*this.loop.playhead_selections.length)];

					psegment_id = ps[Math.floor(Math.random()*ps.length)]
					//console.log("random pick from play head",ps,segment_id)
				}
			}
		}else{
			// the lower selection_ids (starting from 0) come from palette.. the upper selection_ids come from playhead
			if(selection_id >= this.loop.palette_selections.length + this.loop.playhead_selections.length ){
				// selection_id is too high, so grab any segment
				return from_palette("all")
			}else if(selection_id >= this.loop.palette_selections.length){
				play = this.loop.playhead_selections[selection_id - this.loop.palette_selections.length] // segment comes from playhead selection
				psegment_id = play[Math.floor(Math.random()*play.length)]
			}else{
				ps = this.loop.palette_selections[selection_id] // segment comes from palette selection
				palette_index = ps[Math.floor(Math.random()*ps.length)]
				song = songs[palette_index[0]]
				segment_id = song.palette_segments[palette_index[1]]
				psegment_id = [palette_index[0], segment_id]
			}
		}
		//console.log("fromplaette_segment_id",segment_id)
		return psegment_id

	}



    this.randomize_parameters = function(){
    	console.log("random!!")
    	$('#tempo_slider').slider('setValue',Math.random()*100);
    	this.tempoChange()

    	step_max = $('#step_slider').data('slider').max
    	step_min = $('#step_slider').data('slider').min
    	$('#step_slider').slider('setValue',Math.floor(Math.random()*(step_max-step_min))+step_min);

    	pulse_max = $('#pulse_slider').data('slider').max
    	pulse_min = $('#pulse_slider').data('slider').min
    	$('#pulse_slider').slider('setValue',Math.floor(Math.random()*(pulse_max-pulse_min))+pulse_min);
    	this.rhythmChange()

		this.update_rhythm(false)
		this.play_loop();
    }

    this.refresh_loop = function(){
		this.update_rhythm(false);
		this.play_loop();
    }

    this.load_loop = function(loop){
    	console.log("load loop", loop.layer,  loop)
		this.loop = loop; 

    	$('#tempo_slider').slider('setValue',ilog_tempo(this.loop.tempo));
    	this.tempoChange()

    	$('#step_slider').slider('setValue',this.loop.steps);
    	this.rhythmChange()
    	$('#pulse_slider').slider('setValue',this.loop.pulses);
		this.rhythmChange()

		if(!this.loop.layer) this.loop.layer = "on earth"
	 	updateLoopOptions(this.loop);

    	//song.highlight_all(null,null)  

		this.rhythm_display.draw(this.loop.steps, this.loop.play_segment_list)
		this.play_loop()

    }


    this.save_loop = function(){

    	/* loop = new Loop(song = this, 
    		tempo = log_tempo(tempo_slider.getValue()), 
    		steps = step_slider.getValue(), 
    		pulses = pulse_slider.getValue(), 
    		playhead_selections = _song.playhead_selections,
    		palette_selections = _song.palette_selections,
    		play_segment_list = _song.play_segment_list,
    		chaos = _song.chaos,
    		flows = _song.flows,
    		forever = _song.forever,
    		layer = _song.layer); */

    	console.log("saved loop", this.loop)
    	return this.loop 

    }


    /*
	// next segment plays whenever previous segment ends
	this.play_flows = function(s){
		if(this.chaos == "chaos"){	
			psegment_id = this.from_palette("all")
			// update visual segments
		}else{ // normal
			psegment_id = this.play_segment_list[s].segment_id
		}
		segment_id = psegment_id[1]
		song = this.songs[psegment_id[0]]
		//console.log("this",this)

		//console.log("s",s,"segment_id",segment_id,"chaos",this.chaos,"forever", this.forever)
		segment = song.segments[segment_id]
		step_duration =  60 / this.tempo / this.steps * this.play_segment_list[s].step_length;
		// create event to trigger when sample starts

		this.play(0, 0, 0.0001, segment_id, this.reactToSegment, 0, this.layer)

		this.play(0, segment.start, step_duration, segment_id, function(old_segment_id){
			
			s = s + 1
			//console.log("--","s",s,"play_segment_list",song.play_segment_list,song.play_segment_list.length,"forever",this.forever)
			if(s == _song.play_segment_list.length){
				if(_song.forever == "forever"){
					_song.play_flows(0);
				}else if(_song.forever =="once"){
					// nothing, that's it. we're done.
				}else if(_song.forever == "and so on"){
					// play the rest of the song
					final_segment = _song.segments[_song.segments.length-1]
					final_time = final_segment.start + final_segment.duration
					begins = segment.start+step_duration
					duration = final_time - begins
					_song.play(0, begins, duration, 0, null, 1);
				}
			}else{
				_song.play_flows(s);
			}
		}, 1, layer)
	}*/

	// called when settings change, or when sampler key is pressed
	// songs are the list of songs  from the segment list (usually just one 1)
	this.play_loop = function(){
		if(_cr.no_actions_yet){ // the first time the user does anything, show rhythm controls
			showMore();
			console.log("floop")
			_cr.no_actions_yet = false;
		}
		//console.log("play_list", this.sound_loaded)
		if(this.loop.all_sounds_loaded()){
			/*this.stop_audio()
			var then = 0
			
			if(this.flows == "flows"){
				//this.play_flows(0)  
				// this way sounds shitty
			}else{

			}
			
			step_size =  60 / this.tempo / this.steps;
			var seg = 0;
			for(var step=0;step<this.steps;step++){

				segment_id = play_segment_list[seg].segment_id
				segment = this.segments[segment_id]

				if(play_segment_list[seg].step_length == 1)

				step_duration = step_size * play_segment_list[seg].step_length;		

				// create event to trigger when sample starts
				this.play(Math.max(0,then - this.latency), 0, 0.0001,segment_id,this.reactToSegment,0)

				this.play(then, segment.start, step_duration, segment_id, null, 1 )
				
				then += step_duration		
			}*/

			///*
			// old way: sounds good, but needs to be more flexible
			if(this.loop.layer == "in space"){
				// stop nothing
			}else if(this.loop.layer == "on earth"){
				_cr.stop_audio("on earth");
			}else if(this.loop.layer == "on neptune"){
				_cr.stop_audio("on neptune");
			}else{
				_cr.stop_audio();
			}
			then = 0
			//console.log("play_segment_list", play_segment_list)
			if(this.loop.forever == "forever"){
				num_loops = 32; // not **really** forever, but we should fix that
			}else{
				num_loops = 1;
			}

			for(var loops=0;loops<num_loops;loops++){
				for(var s=0;s<play_segment_list.length;s++){
					if(this.chaos == "chaos"){
						psegment_id = this.from_palette("all")
						segment_id = psegment_id[1]
						palette_id = psegment_id[0]
						song = songs[palette_id]
					}else{
						segment_id = play_segment_list[s].segment_id
						song = songs[play_segment_list[s].palette_id];
					}
					segment = song.segments[segment_id]

					step_duration =  60 / this.loop.tempo / this.loop.steps * this.loop.play_segment_list[s].step_length;

					// create event to trigger when sample starts
					song.soundbuffer.play(then, 0, 0.0001,segment_id,_cr.reactToSegment,0, this.loop.layer)
					if(this.flows == "flows"){//step_duration <= segment.duration){
						song.soundbuffer.play(then, segment.start, step_duration, segment_id, null, 1, this.loop.layer)
					}else{ // this is for if you want to just play video segments one at a time, without keeping playing. Its kinda ugly
						song.soundbuffer.play(then, segment.start, segment.duration, segment_id, null, 1, this.loop.layer)
					}

					//console.log("this.play", segment.start, step_duration)
					then += step_duration
				}
				
			}
			if(this.loop.forever == "and so on"){
				song.soundbuffer.play(then, segment.start + segment.duration, 999999, 0, null, 1, this.layer)
			}
		}
	}
}

// global object
var CrowdRemix = function(){

	this.songs = {}; 

	this.latency = 0; // hasn't yet been implemented (but probably would be useful for syncing up color effects to sound)
	this.global_tempo = 80; // hasn't been implemented

    // actually part of loop, should be its own object:

    var _cr = this

    this.palette_selections = [[]]
    this.playhead_selections = [[]]

    this.earth = new LoopStation("earth");
    this.neptune = earth;
    this.space = earth;

    this.layers = {"on earth": earth,
    	"on neptune": neptune,
    	"in space": space }

   	this.have_video = false // true if we're remixing a video
   	this.parameters_changed = false // flag used in quantization. 
   	this.no_actions_yet = true // set to false after the user does any sound activity


	// function gets called at beginning of every audio segment
	this.reactToSegment = function(song, segment_id){
		hue = song.palette_hues[song.palette_segments.indexOf(segment_id)];
		start_time = song.segments[segment_id].start;

		// makes the "Crowd Remix" logo thing glow
		$(".navbar-brand").css("color",rgbCode(hslToRgb(hue, 0.8, 0.5)))

		if(this.have_video){
			$("#video").css("-webkit-filter", "sepia(100%) hue-rotate("+(hue*360-60)+"deg) saturate(10)")
			$('#video')[0].currentTime = start_time;
			$('#video')[0].play();
			$("#video")[0].volume = 0;
			//console.log(hue, start_time);
		}

		if(this.parameters_changed){
			//_song.parameters_changed = false
			//this.play_list(_song.play_segment_list)
		}
	}

/****/

	

	this.stop_audio = function(layer){
		console.log("stop audio", layer);
		try{
			if(layer==undefined){
				$.each(songs, function(song){ 
					song.soundbuffer.stopAll(0); 
				});
			}else{
				$.each(songs, function(song){ 
					song.soundbuffer.stopLayer(0,layer)
				});
			}
		}catch(e){
			console.log("error stopping audio", e)
		}
	}


    this.addVideo = function(video_url){
    	$("#video-container").html('<div style="padding-top: 15px">\
        	<video src="'+video_url+'" id="video" width="100%" preload="auto"/> \
    		</div>');
    	$("#video-container").show();
    	console.log("added video" + video_url);
    	this.have_video = true;

    }

	this.pauseVideo = function(){
		$("#video")[0].pause();
	}

    /**  SOUND!! **/
    /*
	var sound = new load_sound(mp3, function(){
		console.log("Finished loading MP3");
		_song.sound_loaded = true
		$("#loading-audio").hide();
		$("#playhead-and-palette").show();
		console.log("savedLoops", savedLoops)
		if(Object.keys(savedLoops).length>0){
			$(".keyboard").show();
		}

	})
	sound.init();
	this.sound = sound*/


	this.init();

}


function RhythmDisplay(rhythm_display_id){
	this.rhythm_display_id = rhythm_display_id
	this.draw = function(steps,play_segment_list){
		rd = $("#"+rhythm_display_id);
		beat_bars = ""
		//console.log(play_segment_list);
		for(var s=0;s<play_segment_list.length;s++){
			step_length = play_segment_list[s].step_length;
			percent_length = step_length / steps * 100
			pixel_length = $("#rhythm-display").width() * percent_length / 100
			segment_id = play_segment_list[s].segment_id;
			song = play_segment_list[s].song;
			hue = song.palette_hues[song.palette_segments.indexOf(segment_id)]

			c1 = rgbCode(hslToRgb(hue, 0.8, 0.5))
			c2 = rgbCode(hslToRgb(hue, 1.0, 0.3))
			//console.log(hue, play_segment_list, play_segment_list[s], play_segment_list[s].segment_id, _song.palette_segments.indexOf(play_segment_list[s].segment_id))
			beat_bars +='<div class="progress-bar" id="segment_'+segment_id+'-'+step_length+'" style="width: '+pixel_length+'px; background-image: linear-gradient(to right bottom, '+c1+' 0,'+c2+' 100%);"></div>';
		}
		rd.empty()
		rd.html(beat_bars)
	}

	this.draw(0,[])

}



function Playhead(playhead_id, playhead_highlight_id, song){
	this.playhead_id = playhead_id
	this.playhead_highlight_id = playhead_highlight_id
	this.segments = song.segments
	this.palette_segments = song.palette.segment_ids
	this.palette_hues = song.palette.hues
	this.song = song
	this.dragging = false;
	this.drag_stop = 0;
	var _playhead = this

	this.highlight = function(highlightSegmentIDs){
		highlightSegmentIDs = unique(highlightSegmentIDs)
		var canvas = document.getElementById(this.playhead_highlight_id);
		var context = canvas.getContext('2d');
		var totalSegments = Object.keys(this.segments).length;
		var old_width = canvas.width;
		var segmentWidth = 1;
		canvas.width = totalSegments * segmentWidth;
		var width = canvas.width ;
		var height = canvas.height;

		context.clearRect(0, 0, width, height);

		var x = 0;
		var y = canvas.height/2;
		var old_x = -1;
		context.beginPath();

		context.moveTo(0, height);
		
		for (h=0; h<highlightSegmentIDs.length; h+=1){ 
			s = highlightSegmentIDs[h]
			// if(s % 4  != 0) continue;
			segment = this.segments[s]
			hue = this.palette_hues[this.palette_segments.indexOf(s)]
			//console.log(hue)
			color = hslToRgb(hue, 1, 0.5)
			color = rgbCode(color)
			//console.log(color)

			//console.log(segment)
			x = segmentWidth * s;
			if(old_x == x) continue; // don't draw two data points on the same x

			context.beginPath();

			if(segment.hasOwnProperty("loudness_max")){
				// change height according to loudness
				new_height = height * (segment.loudness_max+60)/60
				edge = (height-new_height)/2;
				//console.log(segment.loudness_max, new_height, height, edge)
				context.rect(x, edge, 1, height-(edge*2));
				songsound.loudness_info = true
			}else{
				context.rect(x, 0, 1, height);
			}


		

			context.fillStyle = color; // straight color
			context.lineWidth = 1;
			context.strokeStyle = color;
			context.stroke();
				
			
			context.fill();
			
			
			old_x = x;
		}
	};

	// highlightSegmentIDs : list of ordered segment_ids
	this.draw = function (){
		var canvas = document.getElementById(this.playhead_id);
		var context = canvas.getContext('2d');
		
		var totalSegments = Object.keys(this.segments).length;
		var old_width = canvas.width;
		var segmentWidth = 1;
		canvas.width = totalSegments * segmentWidth;
		var width = canvas.width ;
		var height = canvas.height;
		
		context.clearRect(0, 0, width, height);
		var x = 0;
		var y = canvas.height/2;
		var old_x = -1;
		context.beginPath();

		context.moveTo(0, height);
		
		for (s=0; s<totalSegments; s+=1){ 
			segment = this.segments[s]
			// if(s % 4  != 0) continue;
			//hue = this.palette.indexOf(s) / totalSegments
			hue = this.palette_hues[this.palette_segments.indexOf(s)]
			//console.log(hue)
			color = hslToRgb(hue, 1, 0.5)
			color = rgbCode(color)
			//console.log(color)

			//console.log(segment)
			x = segmentWidth * s;
			if(old_x == x) continue; // don't draw two data points on the same x

			context.beginPath();

			if(segment.hasOwnProperty("loudness_max")){
				// change height according to loudness
				new_height = height * (segment.loudness_max+60)/60
				edge = (height-new_height)/2;
				//console.log(segment.loudness_max, new_height, height, edge)
				context.rect(x, edge, 1, height-(edge*2));
				context.fillStyle = alphaColor(color, 0.3); // straight color
				this.loudness_info = true
			}else{
				context.rect(x, 0, 1, height);
				context.fillStyle = alphaColor(color, 0.1); // straight color
			}
			


			context.fill();
			
			
			old_x = x;
		}

		if(this.loudness_info){

			$(".playhead").addClass(".amplitude")
			$(".playhead").removeClass(".no-amplitude")
		}else{
			$(".playhead").removeClass(".amplitude")
			$(".playhead").addClass(".no-amplitude")

		}
	}




	$("#"+playhead_highlight_id).on("mousemove",function(e){
		ph = _playhead
		song = _playhead.song
		var w = $(this).width()
        var x = (e.pageX - $(this).offset().left); //offset -> method allows you to retrieve the current position of an element 'relative' to the document
   		var segment_id = Math.round(ph.segments.length * (x/w));

		if(segment_id <= 0) segment_id = 0;
		if(segment_id >= song.segments.length) segment_id = song.segments.length - 1;


        if(ph.dragging){
        	if(ph.drag_start < segment_id){
				song.highlight_all(range(ph.drag_start,segment_id), null)
			}else{
				song.highlight_all(range(segment_id,ph.drag_start), null)
			}
        }else{
        	
        	if(song.playhead_selections.length==0){
        		song.playhead_selections.push([]);
        	}
        	song.highlight_all(flatten(song.playhead_selections).concat([segment_id]),null)
        }

	});

	$("#"+playhead_highlight_id).on("mousedown", function(e){
		ph = _playhead
		song = _playhead.song
		var w = $(this).width()
        var x = (e.pageX - $(this).offset().left); //offset -> method allows you to retrieve the current position of an element 'relative' to the document
		ph.dragging = true
		ph.drag_start = Math.round(song.segments.length * (x/w));

		if(ph.drag_start <= 0) ph.drag_start = 0;
		if(ph.drag_start >= song.segments.length) ph.drag_start = song.segments.length - 1;


		if(e.shiftKey){

			song.removeZeroSizeSelections()
			ph.current_selection = song.playhead_selections.length;
			song.playhead_selections.push([])
		}else{
			ph.current_selection = 0
			song.playhead_selections = []
			song.playhead_selections.push([ph.drag_start])

			// reset palette too
			song.palette_mapper.current_selection = 0
			song.palette_selections = [[]]
		}	

		song.highlight_all([ph.drag_start],null);

	})

	$("#"+playhead_highlight_id).on("mouseup", function(e){
		
		ph = _playhead
		song = _playhead.song
		var w = $(this).width()
        var x = (e.pageX - $(this).offset().left); //offset -> method allows you to retrieve the current position of an element 'relative' to the document
		if(ph.dragging){
			ph.dragging = false;
			ph.drag_stop = Math.round(song.segments.length * (x/w));

			if(ph.drag_stop <= 0) ph.drag_stop = 0;
			if(ph.drag_stop >= song.segments.length) ph.drag_stop = song.segments.length - 1;


			if(ph.drag_stop < ph.drag_start){
				song.playhead_selections[ph.current_selection] = range(ph.drag_stop,ph.drag_start,1)
			}else if(ph.drag_stop > ph.drag_start){
				song.playhead_selections[ph.current_selection] = range(ph.drag_start,ph.drag_stop,1)	
			}else{
				song.playhead_selections[ph.current_selection] = [ph.drag_stop]
			}
			song.highlight_all(flatten(song.playhead_selections),null);
			song.update_rhythm(false)
			song.play_list(song.play_segment_list);
		}else{

		}
	})


	$("#"+playhead_highlight_id).on("mouseout", function(e){
		
		ph = _playhead
		song = _playhead.song
		var w = $(this).width()
        var x = (e.pageX - $(this).offset().left); //offset -> method allows you to retrieve the current position of an element 'relative' to the document
		if(ph.dragging){
			ph.dragging = false;
			song.playhead_selections[ph.current_selection] = []
			song.removeZeroSizeSelections()
			song.highlight_all(flatten(song.playhead_selections),null);
			song.update_rhythm(false)
			song.play_list(song.play_segment_list);
		}else{

		}
	})




	this.draw()
}

function PaletteMapper(palette_mapper_id, palette_mapper_highlight_id, song){
	this.palette_mapper_id = palette_mapper_id
	this.palette_mapper_highlight_id = palette_mapper_highlight_id
	this.segments = song.segments
	this.palette_segments = song.palette["segment_ids"]
	this.palette_hues = song.palette["hues"]

	var _pm = this

	this.draw = function (){
		var canvas = document.getElementById(this.palette_mapper_id);
		var context = canvas.getContext('2d');
		
		var totalSegments = Object.keys(this.palette_segments).length;
		var old_width = canvas.width;
		var segmentWidth = 1;
		canvas.width = totalSegments * segmentWidth;
		var width = canvas.width ;
		var height = canvas.height;
		
		context.clearRect(0, 0, width, height);
		var x = 0;
		var y = canvas.height/2;
		var old_x = -1;
		context.beginPath();

		context.moveTo(0, height);
		
		for (p=0; p<totalSegments; p+=1){ 

			// if(s % 4  != 0) continue;
			//hue = p / totalSegments
			hue = this.palette_hues[p]
			//console.log(hue)
			color = hslToRgb(hue, 1, 0.5)
			color = rgbCode(color)
			//console.log(color)

			//console.log(segment)
			x = segmentWidth * p;
			if(old_x == x) continue; // don't draw two data points on the same x

			context.beginPath();
			context.rect(x, 0, 1, height);
			
			context.fillStyle = alphaColor(color, 0.2); // straight color

			context.fill();
			
			
			old_x = x;
		}
	}



	this.highlight = function(highlightPaletteIndices){
		highlightPaletteIndices = unique(highlightPaletteIndices)
		//console.log(highlightPaletteIndices);
		var canvas = document.getElementById(this.palette_mapper_highlight_id);
		var context = canvas.getContext('2d');
		var totalSegments = Object.keys(this.palette_segments).length;
		var old_width = canvas.width;
		var segmentWidth = 1;
		canvas.width = totalSegments * segmentWidth;
		var width = canvas.width ;
		var height = canvas.height;
		context.clearRect(0, 0, width, height);

		var x = 0;
		var y = canvas.height/2;
		var old_x = -1;
		context.beginPath();

		context.moveTo(0, height);
		
		for (h=0; h<highlightPaletteIndices.length; h+=1){ 
			p = highlightPaletteIndices[h]
			hue = this.palette_hues[p]
			//console.log(hue)
			color = hslToRgb(hue, 1, 0.5)
			color = rgbCode(color)
			//console.log(color)

			//console.log(segment)
			x = segmentWidth * p;
			if(old_x == x) continue; // don't draw two data points on the same x

			context.beginPath();
			context.rect(x, 0, 1, height);
			
			context.fillStyle = color; // straight color
			context.lineWidth = 1;
			context.strokeStyle = color;
			context.stroke();
				
			
			context.fill();
			
			
			old_x = x;
		}
	};



	$("#"+palette_mapper_highlight_id).on("mousemove",function(e){
		//console.log(e)
		pm = _pm
		song = pm.song

		var w = $(this).width()
        var x = (e.pageX - $(this).offset().left); //offset -> method allows you to retrieve the current position of an element 'relative' to the document
   		var palette_index = Math.round(song.palette_segments.length * (x/w));
		
		if(palette_index <= 0) palette_index = 0;
		if(palette_index >= song.palette_segments.length) palette_index = song.palette_segments.length - 1;


        if(pm.dragging){
        	if(pm.drag_start < palette_index){
				song.highlight_all(null, range(pm.drag_start,palette_index))
			}else{
				song.highlight_all(null, range(palette_index,pm.drag_start))
			}
        }else{
        	if(song.palette_selections.length==0){
        		song.palette_selections.push([]);
        	}
        	song.highlight_all(null, flatten(song.palette_selections).concat([palette_index]))
        }

	});


	$("#"+palette_mapper_highlight_id).on("mousedown", function(e){
		pm = _pm
		song = pm.song
		var w = $(this).width()
        var x = (e.pageX - $(this).offset().left); //offset -> method allows you to retrieve the current position of an element 'relative' to the document
		pm.dragging = true
		pm.drag_start = Math.round(song.palette_segments.length * (x/w));

		if(pm.drag_start <= 0) pm.drag_start = 0;
		if(pm.drag_start >= song.palette_segments.length) pm.drag_start = song.palette_segments.length - 1;
		pm.drag_stop = pm.drag_start

		if(e.shiftKey){
			song.removeZeroSizeSelections()
			pm.current_selection = song.palette_selections.length;
			song.palette_selections.push([])
		}else{
			pm.current_selection = 0
			song.palette_selections = []
			song.palette_selections.push([pm.drag_start])

			song.playhead.current_selection = 0
			song.playhead_selections = [[]]
		}	
		
		song.highlight_all(null, [pm.drag_start]);


	})

	$("#"+palette_mapper_highlight_id).on("mouseup", function(e){
		
		pm = _pm
		song = pm.song
		var w = $(this).width()
        var x = (e.pageX - $(this).offset().left); //offset -> method allows you to retrieve the current position of an element 'relative' to the document
		if(pm.dragging){
			pm.dragging = false;
			pm.drag_stop = Math.round(song.palette_segments.length * (x/w));

			if(pm.drag_stop <= 0) pm.drag_stop = 0;
			if(pm.drag_stop >= song.palette_segments.length) pm.drag_stop = song.palette_segments.length - 1;

			//console.log(pm.drag_start, pm.drag_stop)
			if(pm.drag_stop < pm.drag_start){
				song.palette_selections[pm.current_selection] = range(pm.drag_stop,pm.drag_start,1)
			}else if(pm.drag_stop > pm.drag_start){
				song.palette_selections[pm.current_selection] = range(pm.drag_start,pm.drag_stop,1)	
			}else{
				song.palette_selections[pm.current_selection] = [pm.drag_stop]
			}
			song.highlight_all(null, flatten(song.palette_selections));
			song.update_rhythm(false)
			song.play_list(song.play_segment_list);
		}



	})


	$("#"+palette_mapper_highlight_id).on("mouseout", function(e){
			
		pm = _pm
		song = pm.song
		var w = $(this).width()
        var x = (e.pageX - $(this).offset().left); //offset -> method allows you to retrieve the current position of an element 'relative' to the document
		if(pm.dragging){
			pm.dragging = false;
			song.palette_selections[pm.current_selection] = []

			song.removeZeroSizeSelections()
			
			song.highlight_all(null, flatten(song.palette_selections));
			song.update_rhythm(false)
			song.play_list(song.play_segment_list);
		}

	})

	this.draw()
}







