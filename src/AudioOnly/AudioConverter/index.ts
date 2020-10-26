import * as waveFile from 'wavefile'
import * as alawmulaw from 'alawmulaw'


const sample = 'fn5+fn5+fv7+/v7+/v5+fn5+fn5+fn5+fn5+//7+fv5+/v7+/n5+fn5+fn5+fn7+fv5+fv5+/////////f/9///9/f/9/f///n5+fn7+/v5+fn5+fn5+fv/////9//39/f////39///9/f3//n7+/n7+/v5+fn5+fn5+/v7+fn5+fn7+fv7+fn7+fv7+/n5+fv7+fv7+/v5+fn5+fn5+fg==';

const result = alawmulaw.mulaw.decode(sample);


// const wav = new waveFile.WaveFile();


