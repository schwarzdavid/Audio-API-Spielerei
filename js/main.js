(function(){
	'use strict';

	var audioCtx = new window.AudioContext(),
		audioSrc = audioCtx.createBufferSource(),
		audioAnalyser = audioCtx.createAnalyser(),
		canvas, canvasCtx, audioFile;

	function startPlayer(){
		var dataArray = new Uint8Array(audioAnalyser.frequencyBinCount / 5.05),
			factor = 1.4;

		audioSrc.start(0);
		canvasCtx.strokeStyle = '#FFFFFF';

		var maxLength = 0;

		window.requestAnimationFrame(function play(){
			audioAnalyser.getByteFrequencyData(dataArray);
			resetCanvas();

			canvasCtx.beginPath();
			canvasCtx.moveTo(-1, canvas.height);
			canvasCtx.lineTo(-1, canvas.height - (dataArray[i] * factor));

			for(var i = 0; i < dataArray.length; i++){
				canvasCtx.lineTo(i*(canvas.width / dataArray.length), canvas.height - (dataArray[i] * factor));
			}

			canvasCtx.lineTo(canvas.width + 1, canvas.height - (dataArray[dataArray.length - 1] * factor));
			canvasCtx.lineTo(canvas.width + 1, canvas.height);

			canvasCtx.fillStyle = 'rgba(0,0,0,.4)';
			canvasCtx.stroke();
			canvasCtx.fill();

			window.requestAnimationFrame(play);
		});
	}

	function resetCanvas(){
		canvasCtx.fillStyle = '#2c2c2c';
		canvasCtx.fillRect(0,0,canvas.width,canvas.height);
	}

	function loadPlayer(){
		canvas = document.querySelector('canvas');
		canvasCtx = canvas.getContext('2d');

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		document.querySelector('.spinner').classList.add('overlay');
		setTimeout(function(){
			var player;

			resetCanvas();
			document.querySelector('.spinner').style.display = 'none';

			player = document.querySelector('.player');
			player.querySelector('h1').innerText = (function(){
				var parts = audioFile.name.split('.');
				parts.pop();
				return parts.join('.') || 'Dateiname';
			}());
			player.querySelector('span').innerHTML = (Math.round(audioFile.size / 1024 / 1024 * 100) / 100) + ' MB';
			player.classList.add('active');

			startPlayer();
		}, 1000);
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

			audioFile = {
				name: f.name,
				size: f.size,
				type: f.type
			};

			audioCtx.decodeAudioData(reader.result, function(buffer){
				clearInterval(interval);
				writeLog('Finished!');

				audioFile.duration = buffer.duration;

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
		audioSrc.connect(audioAnalyser);
		audioAnalyser.connect(audioCtx.destination);
		audioAnalyser.fftSize = 4096;

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