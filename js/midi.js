


function loadMIDIplugin(){

	var Jazz = document.getElementById("Jazz1"); if(!Jazz || !Jazz.isJazz) Jazz = document.getElementById("Jazz2");
	
}


function midiPlay(){
	 if(Jazz.isJazz){
	  Jazz.MidiOut(0x90,60,100);
	  Jazz.MidiOut(0x90,64,100);
	  Jazz.MidiOut(0x90,67,100);
	 }
}

function midiStop(){
 if(Jazz.isJazz){
  Jazz.MidiOut(0x80,60,0);
  Jazz.MidiOut(0x80,64,0);
  Jazz.MidiOut(0x80,67,0);
 }
}
