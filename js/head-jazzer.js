function HeadJazzerSong(data){
	// existential
	var _song = this

	// data
	this.data = data;
	//this.filename_mixdown = data.filename;
	this.sections = data.sections
	this.waveform_vector = data.waveform_vector
	this.stems = data.stems
	this.num_stems = this.stems.length

  	// interface
  	this.playheads = []

  	// params
  	this.sample_rate = 44100

	this.init = function(){
		console.log("stems", this.data)
		// empty playheads
		$("#playheads").empty()
		this.playheads = []

		// make new playheads
		$.each(this.stems, function(i,stem){
			var playhead = new Playhead(i,stem)
			playhead.create("#playheads")
			_song.playheads.push(playhead)
		});
	}


   	/** PLAYHEAD **/

	function Playhead(i,stem){
		var _playhead = this
		this.i = i;
		this.stem = stem;
		this.playhead_container_id = "playhead-container_" + i
		this.playhead_id = "playhead_" + i;
		this.playhead_highlight_id = "playhead-highlight_" + i
		this.segments = stem.notes;
		this.file = stem.file;
		this.alignment = stem.hasOwnProperty("alignment") ? stem.alignment : 0
		this.drums = stem.drums;

		this.create = function(attach_to){
			var html = '<div id="'+this.playhead_container_id+'" class="playhead-container">\
				<div style="float: left">\
					\
				</div>\
				<div style="float: left">\
				<canvas id="'+this.playhead_id+'" class="playhead"></canvas>\
				<canvas id="'+this.playhead_highlight_id+'" class="playhead"></canvas>\
				</div>\
			</div>';

			$(attach_to).append(html)
			this.draw()
		}

		/*
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
				hue = 0.1 // this.palette_hues[this.palette_segments.indexOf(s)]
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
					this.loudness_info = true
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
		*/

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
				
				color = "FF0000"

				x = segmentWidth * s;
				if(old_x == x) continue; // don't draw two data points on the same x

				context.beginPath();

				if(segment.hasOwnProperty("intensity")){
					// change height according to loudness
					new_height = height * (segment.intensity+60)/60
					edge = (height-new_height)/2;
					console.log(segment.intensity, new_height, height, edge)
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

	}

	this.init()

}

/** BEGIN color methods**/
function alphaColor(hex, alpha){
    var red = hex.substr(1, 2), green = hex.substr(3, 2), blue = hex.substr(5, 2);
    color = "rgba(" + parseInt(red, 16) + "," + parseInt(green, 16) + "," + parseInt(blue, 16) + "," + alpha + ")";
    return color;
}