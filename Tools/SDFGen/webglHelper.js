"use strict";
var mApp = {};

mApp.drawFullscreenQuad = function(gl, program, directBlit) {
    if (!gl || !program) {
      return;
    }
    // look up where the vertex data needs to go.
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    var texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");

    // Create a buffer and put a single pixel space rectangle in
    // it (2 triangles)
    var positionBuffer = gl.createBuffer();
    // Bind the position buffer so gl.bufferData that will be called
    // in setRectangle puts data in the position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Set a rectangle fullscreen rect for pos buffer
    mApp.setFullRect(gl);
    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    // provide texture coordinates for the rectangle.
    var texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0,  0.0,
        1.0,  0.0,
        0.0,  1.0,
        0.0,  1.0,
        1.0,  0.0,
        1.0,  1.0,
    ]), gl.STATIC_DRAW);
    // Turn on the attribute
    gl.enableVertexAttribArray(texCoordAttributeLocation);
    // Tell the attribute how to get data out of texCoordBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(texCoordAttributeLocation, size, type, normalize, stride, offset);
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // Clear the canvas
    if(directBlit)
    {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);
    //bind uniforms    
    mApp.glBindUniform(gl, program, "u_threshold", mApp.previewThreshold/255);

    if(directBlit)
    {
      gl.disable(gl.BLEND);
    }
    else
    {
      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    }
    //Draw the rectangle.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
}

mApp.previewThreshold = 128;

mApp.glBindTextures = function(gl, program, uniformNames, images)
{
  //TODO: adding additional vars to program is AntiPattern, but works for now
  if(program.boundTextures === undefined) program.boundTextures = {};
  
  for(var i = 0; i < uniformNames.length; i++)
  {
    if(!!uniformNames[i] && !!images[i])
    {
      if(program.boundTextures[uniformNames[i]] !== undefined)
      {
        gl.deleteTexture(program.boundTextures[uniformNames[i]]);
      }
      program.boundTextures[uniformNames[i]] = mApp.glBindTexture(gl, program, uniformNames[i], i, images[i]);
    }
  }
}

mApp.glBindUniform = function(gl, program, uniformName, uniformValue)
{
  var uniformLocation = gl.getUniformLocation(program, uniformName);
  if(Array.isArray(uniformValue))
  {
    switch (uniformValue.length)
    {
      case 1:
        gl.uniform1f(uniformLocation, uniformValue[0]);
        break;
      case 2:
        gl.uniform2f(uniformLocation, uniformValue[0],uniformValue[1]);
        break;
      case 3:
        gl.uniform3f(uniformLocation, uniformValue[0],uniformValue[1],uniformValue[2]);
        break;
      case 4:
        gl.uniform4f(uniformLocation, uniformValue[0],uniformValue[1],uniformValue[2],uniformValue[3]);
        break;
    }
  }
  else
  {
    gl.uniform1f(uniformLocation, uniformValue);
  }
}

mApp.glBindTexture = function(gl, program, uniformName, sampleIndex, image)
{
    const texEnum = [gl.TEXTURE0,gl.TEXTURE1,gl.TEXTURE2,gl.TEXTURE3,gl.TEXTURE4];
    var imageLocation = gl.getUniformLocation(program, uniformName);
    // Create a texture.
    var texture = gl.createTexture();
    // make sampleIndex the active texture uint
    // (ie, the unit all other texture commands will affect
    gl.activeTexture(texEnum[sampleIndex]);
    // Bind it to texture unit 0' 2D bind point
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we don't need mips and so we're not filtering
    // and we don't repeat at the edges
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    // Upload the image into the texture.
    var mipLevel = 0;               // the largest mip
    var internalFormat = gl.RGBA;   // format we want in the texture
    var srcFormat = gl.RGBA;        // format of data we are supplying
    var srcType = gl.UNSIGNED_BYTE; // type of data we are supplying
    gl.texImage2D(gl.TEXTURE_2D, mipLevel, internalFormat, srcFormat, srcType, image);

    gl.useProgram(program);
    // Tell the shader to get the texture from texture unit 0
    gl.uniform1i(imageLocation, sampleIndex);

    return texture;
}


mApp.setFullRect = function(gl)
{
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1,
    ]), gl.STATIC_DRAW);
}

mApp.glCreateProgram = function(gl, vertSource, fragSource, keywords)
{
  //const versionStr = `#version 300 es`;
  const versionStr = "";
  var glKeywordStr = "";
  if(keywords !== undefined)
  {
    for(var k of keywords)
    {
      glKeywordStr += "#define " + k + "\n";
    }
  }
  return webglUtils.createProgramFromSources(gl, [versionStr+"\n"+glKeywordStr+"\n"+vertSource, versionStr+"\n"+glKeywordStr+"\n"+fragSource]);
}

mApp.glCreateProgramGroup = function(gl, vertSource, fragSource, keywords)
{
  return GlProgramGroup(gl, vertSource, fragSource, keywords);
}

function GlProgramGroup(gl, vertSource, fragSource, inKeywords)
{
  var result = {};
  result.keywords = inKeywords;
  result.state = [];
  for(var i = 0; i < result.keywords.length; i++)
  {
    result.state.push(true);
  }
  result.programs = {};
  //construct all variants
  var varCount = Math.pow(2, result.keywords.length);
  for(var i = 0; i < varCount; i++)
  {
    var vKeyArr = [];
    var vKeyStr = "";
    for(var j = 0; j < result.keywords.length; j++)
    {
      var enable = Math.floor(i / Math.pow(2,j)) % 2 >= 1;
      if(enable)
      {
        vKeyArr.push(result.keywords[j]);
        if(vKeyArr.length>1) vKeyStr += ",";
        vKeyStr += result.keywords[j];
      }
    }
    if(vKeyArr.length <= 0) vKeyStr = "_";
    result.programs[vKeyStr] = mApp.glCreateProgram(gl, vertSource, fragSource, vKeyArr);
  }
  result.getProgram = function(enabledkeywords)
  {
    if(enabledkeywords === null || enabledkeywords.length == 0)
    {
      return this.programs["_"];
    }
    else
    {
      var trimmed = [];
      for(var i = 0; i < enabledkeywords.length; i++)
      {
        if(enabledkeywords[i] !== undefined && enabledkeywords[i].length > 0)
        {
          trimmed.push(enabledkeywords[i]);
        }
      }
      var query = "";
      for(var i = 0; i < trimmed.length; i++)
      {
        if(i>0) query += ",";
        query += enabledkeywords[i];
      }
      if(this.programs[query] !== undefined)
      {
        return this.programs[query];
      }
    }
    return this.programs["_"];
  };

  result.get = function()
  {
    var enabledWords = [];
    for(var i = 0; i < this.keywords.length; i++)
    {
      if(this.state[i]) enabledWords.push(this.keywords[i]);
    }
    return this.getProgram(enabledWords);
  }

  result.setEnable = function(keyword, enable)
  {
    var ind = this.keywords.indexOf(keyword);
    if(ind >= 0)
    {
      this.state[ind] = enable;
    }
    else
    {
      console.log("cannot find keyword = " + keyword)
    }
  }

  result.isEnable = function(keyword)
  {
    var ind = this.keywords.indexOf(keyword);
    if(ind >= 0)
    {
      return this.state[ind];
    }
    return false;
  }
  return result;
}

