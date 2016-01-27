(function(){
	'use strict';

	var audioCtx = new window.AudioContext(),
		audioSrc = audioCtx.createBufferSource(),
		canvas, canvasCtx;

	function loadPlayer(){
		canvas = document.querySelector('canvas');
		canvasCtx = canvas.getContext('2d');

		canvas.width = window.getComputedStyle(canvas).width;
		canvas.height = window.getComputedStyle(canvas).height;

		document.querySelector('.spinner').classList.add('overlay');
	}

	function parseFile(f){
		var reader = new FileReader();

		writeLog('Reading file...');

		reader.onload = function(){
			var interval = setInterval(function(){
				writeLog('Bitte warten...');
			}, 1500);

			writeLog('Finished!');
			writeLog('Decoding audio file');

			audioCtx.decodeAudioData(reader.result, function(buffer){
				clearInterval(interval);
				writeLog('Finished!');

				audioSrc.buffer = buffer;

				loadPlayer();
			});
		};
		reader.readAsArrayBuffer(f);
	}

	function writeLog(msg){
		document.querySelector('p').innerHTML += msg + '<br>';
	}

	document.addEventListener('DOMContentLoaded', function(){
		document.querySelector('.spinner .filepicker').addEventListener('click', function(e){
			e.preventDefault();
			e.target.querySelector('input[type="file"]').click();
		});

		document.querySelector('.spinner .filepicker input[type="file"]').addEventListener('click', function(e){
			e.stopPropagation();
		});

		document.querySelector('.spinner .filepicker input[type="file"]').addEventListener('change', function(e){
			if(e.target.files[0]){
				document.querySelector('.spinner .circle').classList.add('active');
				parseFile(e.target.files[0]);
			}
		});
	});
}());