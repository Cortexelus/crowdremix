
from numpy import hstack,vstack,array, append, empty
from numpy.random import rand
from scipy.cluster.vq import kmeans,vq

from sklearn import decomposition
import colorsys
import copy
from pydub import AudioSegment
import echonest.remix.audio as audio
import pyechonest.config as config
from math import floor
import sys 

salesman = __import__("salesman-annealing-hyper")

from json import dumps

config.MP3_BITRATE = 192

config.ECHO_NEST_API_KEY = 'ZEFV3NZKLDRGLDL38'

inputFilename=sys.argv[1]

name = sys.argv[2]
#inputFilename="sounds/hotmess.mp3"
song = audio.LocalAudioFile(inputFilename)
print "Analyzed input file"

sas = song.analysis.segments

jsonobj = {}
jsonobj["segments"] = []
jsonobj["palette"] = { "segment_ids": [], "hues": []}
for (id, seg) in enumerate(sas): 
	jsonobj["segments"].append({"start": seg.start, "duration": seg.duration})


# this is just too easy
# song.analysis.segments.timbre is a list of all 12-valued timbre vectors. 
# must be converted to a numpy.array() so that kmeans(data, n) is happy
data = array(sas.timbre)
data = hstack((sas.timbre, sas.pitches))
loudness = array(sas.loudness_max)*4
duration = array(sas.durations)*3
data = vstack((data.T, loudness, duration)).T

# traveling salesman
print "Traveling Salesman on audio segments..."
print "preparing json..."

(city_list, distances) = salesman.tsp_sa(data)


for (i, segment_id) in enumerate(city_list):
	jsonobj["palette"]["segment_ids"].append(segment_id)
	jsonobj["palette"]["hues"].append(distances[i])


f = open(name + ".segments.json", 'w')
f.write(dumps(jsonobj))
f.close()


exit()


"""

print "Cutting segments"

rhythm_vector = [2, 1, 2, 1, 1, 1, 1, 2, 1]
#rhythm_vector = [2, 3, 1, 2]
#rhythm_vector = [2, 1, 2, 1, 1, 1]
#rhythm_vector = [
rhythm_vector = [1]
rvi = 0;
samples = 6000;
measure = []
measures= []

segi = 0; # segment index
while segi < len(segment_ids):
	seg = song[song.analysis.segments[segment_ids[segi]]]
	
	new_length = samples * rhythm_vector[rvi]
	rvi = (rvi + 1) % len(rhythm_vector)
	
	seg = audio.AudioData(None,seg.data[slice(0, new_length, 1)],sampleRate=seg.sampleRate)
	
	out.append(seg)
		
	segi = segi + 1
	
#"""


"""
samples = int(44100 * 0.3);

totalsegs = len(segment_ids)
numsegsout = 30
incr = int(floor(totalsegs/(numsegsout-1)))
for i in range(5, totalsegs, incr):
	seg = song[song.analysis.segments[i]]
	#seg.data+=[0]*(samples-len(seg.data))
	seg = audio.AudioData(None,seg.data[slice(0, samples, 1)],sampleRate=seg.sampleRate)
	out.append(seg)
#"""
print "writing wav"
# write filename
outputFilename = "sounds/"+name+".wav"
out.encode(outputFilename)
