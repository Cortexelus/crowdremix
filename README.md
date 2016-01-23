# Crowd Remix

I have created the most powerful concatenative synthesizer / crowd-source remix engine known to man. 

[Listen to example of song created and performed entirely within Crowd Remix](https://cortexelation.bandcamp.com/track/freeedm-etude-op-1-no-1)

# How it works

Search for any song on EchoNest. Local music and your friends music is preferable, because popular music is an echo chamber; music is popular because it's popular. 

<img src="./vaetxh.png">

It creates a Color Palette of the song using my algorithm:
  1. Segmentation. 
  2. 12-dimensional vector of timbre features for each segment.
  3. Hierarchical clustering of segment vectors. 
  4. Flatten hierarchy to one dimensional array. Similar to how you would turn a binary tree into a linked list.
    <img src="./flattening-tree.png">
  5. Map to hue. 

Now build rhythms with color, it's really simple. 
  * Euclidean rhythms sound really good
  *  Concatenative Synthesis is good for glitch/textures/rhythms

Jam with your keyboard. 
  * Press key and save loop.
  * Recall with same key. 
  * Hit ` to open Chaos Notes. Store composition notes inside. 
  * Loops are saved to database, updated concurrently for any user on that same page. 

Now I can finally fulfill my dream of collaborating with EVERYONE I meet.

Imagine combining this a body-controlled MIDI interface? Fuck being on stage, be in the audience and make music by dancing!

Combining the internet world of crowd source remix, with local music collaboration, with audience-immersive performance -- the ultimate in bringing the world together with music. 
