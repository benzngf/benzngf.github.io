var img;
var canvas;
var w, h;
var ctx;
//imgData.data => array of the real pixel val of the image: size is image size * 4(rgba)
var imgData;
//dom element for output debug txt
var outputTxt;
//var for storing all processed datas
var sdfs;
var pendingDraw = false;
//const
var neighbors = [[0,-1],[-1,0],[1,0],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]];
var neighbors_P = [[-1,0],[-1,-1],[0,-1],[1,-1]];
var neighbors_N = [[1,0],[1,1],[0,1],[-1,1]];
//parameters
var posterizeStep = 6;
var posterizeStepSize;

//parameter DOM
var previewThresSlider;
var stepSlider;
var baseStepSlider;
//TODO:
// 1. 一次跳>1個step時的處理
// 2. Local minimum/maximum 處理


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
function outOfBounds(x,y)
{
	return !(x >= 0 && x < w && y >= 0 && y < h);
}

function len(a){return Math.sqrt(sqrlen(a));}
function sqrlen(a){return a[0]*a[0]+a[1]*a[1];}
function startSdfWorker()
{
	workerVar = {t:0};
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
	if(t >= sdfs.length)
	{
		outputTxt.innerText = "";
		return true;
		//finished
	}
	outputTxt.innerText = "正在處理... （" + Math.round(t*100/sdfs.length) + "%）";
	if(sdfs[t] == null)
	{
		//this is a bad sdf step, simply skip it
		workerVar.t++;
		return false;
	}
	for(var j = 0; j < h; j++)
	{
		for(var i = 0; i < w; i++)
		{
			var ind = ind2d(i,j);
			var curD = -1;
			if(sdfs[t].dist[ind] != null)
			{
				curD = sqrlen(sdfs[t].dist[ind]);
			}
			for(var n = 0; n < 4; n++)
			{
				if(outOfBounds(i + neighbors_P[n][0], j + neighbors_P[n][1])) continue;
				var cmp_ind = ind2d(i + neighbors_P[n][0],j + neighbors_P[n][1]);
				if(sdfs[t].dist[cmp_ind] == null) continue;
				var candidate = [sdfs[t].dist[cmp_ind][0] + neighbors_P[n][0], sdfs[t].dist[cmp_ind][1] + neighbors_P[n][1]];
				var d = sqrlen(candidate);
				if(curD < 0 || d < curD)
				{
					curD = d;
					sdfs[t].dist[ind]= candidate;
				}
			}
		}
	}
	for(var j = h-1; j >= 0; j--)
	{
		for(var i = w-1; i >= 0; i--)
		{
			var ind = ind2d(i,j);
			var curD = -1;
			if(sdfs[t].dist[ind] != null)
			{
				curD = sqrlen(sdfs[t].dist[ind]);
			}
			for(var n = 0; n < 4; n++)
			{
				if(outOfBounds(i + neighbors_N[n][0],j + neighbors_N[n][1])) continue;
				var cmp_ind = ind2d(i + neighbors_N[n][0],j + neighbors_N[n][1]);
				if(sdfs[t].dist[cmp_ind] == null) continue;
				var candidate = [sdfs[t].dist[cmp_ind][0] + neighbors_N[n][0], sdfs[t].dist[cmp_ind][1] + neighbors_N[n][1]];
				var d = sqrlen(candidate);
				if(curD < 0 || d < curD)
				{
					curD = d;
					sdfs[t].dist[ind]= candidate;
				}
			}
		}
	}
	workerVar.t++;
	//unfinished
	return false;
}
function drawProcessedImage()
{
	//get base step
	var baseStep = baseStepSlider.value;
	if(baseStep >= sdfs.length)
	{
		baseStep = sdfs.length - 1;
	}
	//put back value
	for(var j = 0; j < h; j++)
	{
		for(var i = 0; i < w; i++)
		{
			var ind = ind2d(i,j);
			imgData.data[ind*4+3] = 255;
			var outId = null;
			var inId = null;
			//check value to find outside
			for(var t = 0; t < sdfs.length; t++)
			{
				if(sdfs[t] == null) continue;
				if(sdfs[t].val[ind])
				{
					inId = t;
				}
				else
				{
					if(outId == null)
					{
						outId = t;
					}
				}
			}

			var v0;
			var v1;
			if(inId != null && outId != null)
			{
				
				v0 = sdfs[inId].avg;
				v1 = sdfs[outId].avg;
				if(inId > baseStep)
				{
					v0 -= posterizeStepSize;
				}
				if(outId > baseStep)
				{
					v1 -= posterizeStepSize;
				}
			}
			else if(inId != null)
			{
				v0 = sdfs[inId].avg;
				v1 = sdfs[inId].avg + posterizeStepSize;
				if(inId > baseStep)
				{
					v0 -= posterizeStepSize;
					v1 -= posterizeStepSize
				}
			}
			else if(outId != null)
			{
				v0 = sdfs[outId].avg - posterizeStepSize;
				v1 = sdfs[outId].avg;
				if(outId > baseStep)
				{
					v0 -= posterizeStepSize;
					v1 -= posterizeStepSize
				}
			}

			if(inId != null && outId != null)
			{
				var inDist = len(sdfs[inId].dist[ind]);
				var outDist = len(sdfs[outId].dist[ind]);
				if(inDist+outDist <= 0)
				{
					val = (v0+v1)/2;
				}
				else
				{
					val = lerp(v0, v1, inDist/(inDist+outDist));
				}
				imgData.data[ind*4] = val;
				imgData.data[ind*4+1] = val;
				imgData.data[ind*4+2] = val;
			}
			else if(inId != null)
			{
				if(sdfs[inId].maxIn === undefined)
				{
					sdfs[inId].maxIn = 1;
					for(var sdfj = 0; sdfj < h; sdfj++)
					{
						for(var sdfi = 0; sdfi < w; sdfi++)
						{
							if(sdfs[inId].val[ind2d(sdfi,sdfj)])
							{
								var d = len(sdfs[inId].dist[ind2d(sdfi,sdfj)]);
								if(d > sdfs[inId].maxIn)
								{
									sdfs[inId].maxIn = d;
								}
							}
						}
					}
				}
				val = lerp(v0, v1, len(sdfs[inId].dist[ind]) / sdfs[inId].maxIn);
				imgData.data[ind*4] = val;
				imgData.data[ind*4+1] = val;
				imgData.data[ind*4+2] = val;
			}
			else if(outId != null)
			{
				if(sdfs[outId].maxOut === undefined)
				{
					sdfs[outId].maxOut = 1;
					for(var sdfj = 0; sdfj < h; sdfj++)
					{
						for(var sdfi = 0; sdfi < w; sdfi++)
						{
							if(!sdfs[outId].val[ind2d(sdfi,sdfj)])
							{
								var d = len(sdfs[outId].dist[ind2d(sdfi,sdfj)]);
								if(d > sdfs[outId].maxOut)
								{
									sdfs[outId].maxOut = d;
								}
							}
						}
					}
				}
				val = lerp(v0, v1, 1-(len(sdfs[outId].dist[ind]) / sdfs[outId].maxOut));
				val = val < 0? 0 : val;
				imgData.data[ind*4] = val;
				imgData.data[ind*4+1] = val;
				imgData.data[ind*4+2] = val;
			}
			else
			{
				//error
				imgData.data[ind*4] = 255;
				imgData.data[ind*4+1] = 0;
				imgData.data[ind*4+2] = 255;
			}
		}
	}
	ctx.putImageData(imgData, 0, 0);
	refreshPreview();
	pendingDraw = false;
	
}

function debugDrawSDF(id)
{
	//put back value
	for(var j = 0; j < h; j++)
	{
		for(var i = 0; i < w; i++)
		{
			var ind = ind2d(i,j);
			imgData.data[ind*4+3] = 255;
			if(sdfs[id].val[ind])
			{
				imgData.data[ind*4+0] = len(sdfs[id].dist[ind]);
				imgData.data[ind*4+1] = 0;
				imgData.data[ind*4+2] = 0;
			}
			else
			{
				imgData.data[ind*4+0] = 0;
				imgData.data[ind*4+1] = len(sdfs[id].dist[ind]);
				imgData.data[ind*4+2] = 0;
			}
		}
	}
	ctx.putImageData(imgData, 0, 0);
}

function processImage()
{
	posterizeStepSize = 255/(posterizeStep-1);
	//1. determine image steps
	sdfs = [];
	for(var k = 0; k < posterizeStep; k++)
	{
		var hasTrue = false, hasFalse = false;
		var r = [-posterizeStepSize/2 + k*posterizeStepSize];
		r[1] = r[0] + posterizeStepSize;
		sdfs.push({val:[],range:r,dist:[],avg:(r[0]+r[1])/2});
		for(var j = 0; j < h; j++)
		{
			for(var i = 0; i < w; i++)
			{
				var rawVal = imgData.data[ind2d(i,j)*4];
				if(rawVal >= sdfs[k].range[0])
				{
					sdfs[k].val.push(true);
					hasTrue = true;
				}
				else
				{
					sdfs[k].val.push(false);
					hasFalse = true;
				}
				sdfs[k].dist.push(null);
			}
		}
		if(!(hasTrue && hasFalse))
		{
			//bad image, can never generate sdfs, discard it
			sdfs[k] = null;
		}
		else
		{
			//initialize first sdfs by comparing values
			for(var j = 0; j < h; j++)
			{
				for(var i = 0; i < w; i++)
				{
					var bInd = ind2d(i,j);
					var val = sdfs[k].val[bInd];
					for(var n = 0; n < 8; n++)
					{
						var ind = ind2d(i+neighbors[n][0],j+neighbors[n][1]);
						if(sdfs[k].val[ind] != val)
						{
							sdfs[k].dist[bInd] = neighbors[n];
							break;
						}
					}
				}
			}
		}
	}
	pendingDraw = true;
	startSdfWorker();
}

function mainFunction()
{
	c_preview = document.getElementById("previewCanvas");
	c_preview.width = img.naturalWidth;
	c_preview.height = img.naturalHeight;
	gl_preview = c_preview.getContext('webgl', { premultipliedAlpha: false, preserveDrawingBuffer: true });
	pgm_preview = mApp.glCreateProgram(gl_preview, sharedVertSource, baseFragSource);
	previewThresSlider = document.getElementById("previewThresSlider");
	previewThresSlider.oninput = refreshPreview;
	
	//get the pixel data
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	
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
	mApp.previewThreshold = previewThresSlider.value;
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
	var dropArea = document.getElementById('img-importer');
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
	stepSlider = document.getElementById("stepSlider");
	var confirmStepBtn = document.getElementById("confirmStepBtn");
	confirmStepBtn.onclick = ()=>
	{
		if(stepSlider.value != posterizeStep)
		{
			posterizeStep = stepSlider.value;
			if(img.src !== '')
			{
				mainFunction();
			}
		}
	};
	var resetStepBtn = document.getElementById("resetStepBtn");
	resetStepBtn.onclick = ()=>
	{
		if(stepSlider.value != posterizeStep)
		{
			stepSlider.value = posterizeStep;
		}
	};
	baseStepSlider = document.getElementById("baseStepSlider");
	baseStepSlider.oninput = ()=>
	{
		if(!pendingDraw && sdfs !== undefined)
		{
			drawProcessedImage();
		}
	}
}
function handleDrop(e) {
  let dt = e.dataTransfer;
  let files = dt.files;
  document.getElementById('myFile').files = files;
  selectFile();
}