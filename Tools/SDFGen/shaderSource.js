"use strict";
const sharedVertSource = 
`// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
attribute vec2 a_position;
attribute vec2 a_texCoord;

// Used to pass in the resolution of the image
uniform vec2 u_resolution;

// Used to pass the texture coordinates to the fragment shader
varying vec2 v_texCoord;

// all shaders have a main function
void main() {
  //flip y position
  gl_Position = vec4(a_position * vec2(1, -1), 0, 1);

  // pass the texCoord to the fragment shader
  // The GPU will interpolate this value between points.
  v_texCoord = a_texCoord;
}
`;

const baseFragSource = 
`precision highp float;

uniform sampler2D u_image;
uniform float u_threshold;

varying vec2 v_texCoord;

void main() {
  gl_FragColor = (texture2D(u_image, v_texCoord).r > u_threshold)? vec4(1,1,1,1):vec4(0,0,0,1);
}
`;