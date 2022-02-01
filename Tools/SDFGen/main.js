var img;
var canvas;
var w, h;
var ctx;
//imgData.data => array of the real pixel val of the image: size is image size * 4(rgba)
var imgData;
//dom element for output debug txt
var outputTxt;
//var for storing all processed datas
var tuples;
var pendingDraw = false;
//const
var neighbors = [[0,-1],[-1,0],[1,0],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]];
//parameters
var threshold = 20;
var extremeDist = 50;
var baseTuple = 0;
//preview
var c_preview, gl_preview;

function lerp(value1, value2, amount)
{
	amount = amount < 0 ? 0 : amount;
	amount = amount > 1 ? 1 : amount;
	return value1 + (value2 - value1) * amount;
}
function ind2d(x,y)
{
	y = y>=0? (y<h? y:(h-1)):0;
	x = x>=0? (x<w? x:(w-1)):0;
	return y * w + x;
}
function len(a){return Math.sqrt(a[0]*a[0]+a[1]*a[1]);}
function addToTuple(value)
{
	var hasTuple = false;
	for(var i = 0; i < tuples.length; i++)
	{
		if(Math.abs(value - tuples[i].avg) < threshold)
		{
			hasTuple = true;
			tuples[i].sum += value;
			tuples[i].count += 1;
			tuples[i].avg = tuples[i].sum / tuples[i].count;
			tuples[i].min = tuples[i].min>value? value:tuples[i].min;
			tuples[i].max = tuples[i].max<value? value:tuples[i].max;
			break;
		}
	}
	if(!hasTuple)
	{
		//new tuple
		var tmp = {};
		tmp.sum = value;
		tmp.count = 1;
		tmp.avg = value;
		tmp.min = value;
		tmp.max = value;
		tuples.push(tmp);
	}
}
function startSdfWorker()
{
	workerVar = {t:0, step:1};
	function batchStep()
	{
		var finished = false;
		for(var i = 0; i < 10; i++)
		{
			finished = sdfWorkerStep();
			if(finished)
			{
				if(pendingDraw)
				{
					drawProcessedImage();
				}
				return;
			}
		}
		window.setTimeout(batchStep, 0);
	}
	window.setTimeout(batchStep, 0);
}
var workerVar;
function sdfWorkerStep()
{	
	//generate distance field for each steps
	var t = workerVar.t;
	if(t >= tuples.length)
	{
		outputTxt.innerText = "";
		return true;
		//finished
	}
	var hasUnfound = false;
	var step = workerVar.step;
	outputTxt.innerText = "正在處理...  （" + step + "）（" + Math.round(t*100/tuples.length) + "%）";
	for(var j = 0; j < h; j++)
	{
		for(var i = 0; i < w; i++)
		{
			if(tuples[t].dists[ind2d(i,j)] === null) //undetermined distance
			{
				var found = false;
				var minDist = -1;
				//search 8 neighbors
				for(var n = 0; n < 8; n++)
				{
					var ind = ind2d(i+neighbors[n][0],j+neighbors[n][1]);
					
					if(tuples[t].dists[ind] !== null && Math.abs(tuples[t].dists[ind][0]) < step && Math.abs(tuples[t].dists[ind][1]) < step)
					{
						var candidate = [tuples[t].dists[ind][0] + neighbors[n][0],tuples[t].dists[ind][1] + neighbors[n][1]];
						var d = len(candidate);
						if(minDist < 0 || d < minDist)
						{
							minDist = d;
							tuples[t].dists[ind2d(i,j)] = candidate;
							found = true;
						}
					}
				}
				if(!found) hasUnfound = true;
			}
		}
	}
	step++;
	if(!hasUnfound)
	{
		workerVar.step = 1;
		workerVar.t = t + 1;
	}
	else
	{
		workerVar.step = step;
	}
	return false;
}
function drawProcessedImage()
{
	//put back value
	for(var j = 0; j < h; j++)
	{
		for(var i = 0; i < w; i++)
		{
			var ind = ind2d(i,j);
			for(var t = 0; t < tuples.length; t++)
			{
				if(len(tuples[t].dists[ind])<1)
				{
					imgData.data[ind*4+3] = 255;
					if(t==baseTuple)
					{
						var val = tuples[t].avg;
						imgData.data[ind*4] = val;
						imgData.data[ind*4+1] = val;
						imgData.data[ind*4+2] = val;
					}
					else
					{
						//t+1 and t-1
						var tA = t-1>=0? t-1:t;
						var tB = t+1<tuples.length? t+1:t;
						var distA = len(tuples[tA].dists[ind]);
						var distB = len(tuples[tB].dists[ind]);
						if(distA >= 1 && distB >= 1)
						{
							var val;
							if(t>baseTuple)
							{
								val = lerp(tuples[t-1].avg,tuples[t].avg,distA/(distA+distB));
							}
							else
							{
								val = lerp(tuples[t+1].avg,tuples[t].avg,distA/(distA+distB));
							}
							imgData.data[ind*4] = val;
							imgData.data[ind*4+1] = val;
							imgData.data[ind*4+2] = val;
						}
						else
						{
							var val;
							distA = (distA>distB? distA:distB) / extremeDist;
							if(distA>1) distA = 1;
							if(t>baseTuple)
							{
								val = lerp(tuples[t-1].avg,tuples[t].avg,distA);
							}
							else
							{
								val = lerp(tuples[t+1].avg,tuples[t].avg,distA);
							}
							imgData.data[ind*4] = val;
							imgData.data[ind*4+1] = val;
							imgData.data[ind*4+2] = val;
						}
					}
					break;
				}
			}
		}
	}
	ctx.putImageData(imgData, 0, 0);
	pendingDraw = false;
}
function processImage()
{
	//1. determine image steps
	tuples = [];	
	for(var j = 0; j < h; j++)
	{
		for(var i = 0; i < w; i++)
		{
			addToTuple(imgData.data[ind2d(i,j)*4]);
		}
	}
	tuples.sort((a,b)=>{return a.avg - b.avg;});
	//init disance field for each steps
	for(var t = 0; t < tuples.length; t++)
	{
		tuples[t].dists = [];
		for(var j = 0; j < h; j++)
		{
			for(var i = 0; i < w; i++)
			{
				var tmp = imgData.data[ind2d(i,j)*4];
				//store distance [x,y] for better accuracy
				tuples[t].dists.push((tmp>=tuples[t].min&&tmp<=tuples[t].max)? [0,0]:null);
			}
		}
	}
	pendingDraw = true;
	startSdfWorker();
}
function mainFunction()
{
	c_preview = document.getElementById("previewCanvas");
	c_preview.width = img.width;
	c_preview.height = img.height;
	gl_preview = c_preview.getContext('webgl', { premultipliedAlpha: false, preserveDrawingBuffer: true });
	pgm_preview = mApp.glCreateProgram(gl_preview, sharedVertSource, baseFragSource);
	var previewThresSlider = document.getElementById("previewThresSlider");
	previewThresSlider.oninput = function() {
		mApp.previewThreshold = this.value;
		refreshPreview();
	}

	//get the pixel data
	canvas.width = img.width;
	canvas.height = img.height;
	
	ctx = canvas.getContext('2d');
	ctx.drawImage(img,0,0,canvas.width,canvas.height);
	try{
		imgData = ctx.getImageData(0, 0, canvas.width,canvas.height);
	}catch(err){
		alert(err.message+"\n failed to get image data, abort operation");
		return;
	}
	w = canvas.width;
	h = canvas.height;
	processImage();
}
function refreshPreview()
{
	mApp.glBindTextures(gl_preview, pgm_preview,
		["u_image"], [canvas]);
	mApp.drawFullscreenQuad(gl_preview, pgm_preview);
}
function selectFile() {
	var file = document.getElementById('myFile').files[0];
	var reader = new FileReader();
	reader.onloadend = function() {
		img.src = reader.result;
		img.onload = mainFunction;
	};
	if(file) {
		reader.readAsDataURL(file); //reads the data as a URL
    }
	else {
		img.src = '';
    }
}
//init elements
function start()
{
	outputTxt = document.getElementById("output");
	canvas = document.getElementById('modImageCanvas');
	img = document.getElementById('image');
	img.src = '';
	var dropArea = document.getElementById('content-containter');
	var dropArea2 = document.getElementById('uploadbtn');
	['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
	  dropArea.addEventListener(eventName, preventDefaults, false);
	  dropArea2.addEventListener(eventName, preventDefaults, false);
	});
	['dragenter', 'dragover'].forEach(eventName => {
	  dropArea.addEventListener(eventName, highlight, false);
	  dropArea2.addEventListener(eventName, highlight2, false);
	});
	['dragleave', 'drop'].forEach(eventName => {
	  dropArea.addEventListener(eventName, unhighlight, false);
	  dropArea2.addEventListener(eventName, unhighlight, false);
	});
	function preventDefaults (e) {
	  e.preventDefault()
	  e.stopPropagation()
	}
	function highlight(e) {
	  dropArea.classList.add('highlight');
	}
	function highlight2(e) {
	  dropArea2.classList.add('highlight');
	}
	function unhighlight(e) {
	  dropArea.classList.remove('highlight');
	  dropArea2.classList.remove('highlight');
	}
	dropArea.addEventListener('drop', handleDrop, false);
	dropArea2.addEventListener('drop', handleDrop, false);
}
function handleDrop(e) {
  let dt = e.dataTransfer;
  let files = dt.files;
  document.getElementById('myFile').files = files;
  selectFile();
}