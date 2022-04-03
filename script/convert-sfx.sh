#!/bin/bash

for file in sfx/*.wav; do
    new_file=${file%.wav}.mp3
    ffmpeg -i "$file" -vn -ar 44100 -ac 2 -b:a 192k "$new_file"
done