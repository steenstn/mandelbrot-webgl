
    
        let canvas = document.querySelector("#c");
        let gl = canvas.getContext("webgl2");
        if(!gl) {
            alert("WebGL2 not supported");
        }

        var vertexShaderSource = `#version 300 es

in vec2 a_position;
uniform vec2 u_resolution;
out vec4 v_color;
in vec2 start_position;

void main() {
    // convert the position from pixels to 0.0 to 1.0
    //vec2 zeroToOne = a_position / u_resolution;
 
    // convert from 0->1 to 0->2
    //vec2 zeroToTwo = zeroToOne * 2.0;
 
    // convert from 0->2 to -1->+1 (clip space)
    //vec2 clipSpace = zeroToTwo - 1.0;
 
  //gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    gl_Position = vec4(a_position, 0, 1);

  v_color = gl_Position * 2.0;// * 0.5 + 0.5;
}
`;
 
var fragmentShaderSource = `#version 300 es
 
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

in vec4 v_color;
 
uniform vec4 u_color;
uniform float max_iterations;
// we need to declare an output for the fragment shader
out vec4 outColor;
 
void main() {
  float x = 0.0f;
  float y = 0.0f;
  int iterations = 0;
  bool escaped = false;
  for(int i = 0; i < 100000; i++) {
    float x2 = x*x;
    float y2 = y*y;
    float xtemp = x2 - y2 + v_color.x;
    y = 2.0f*x*y + v_color.y;
    x = xtemp;
    if(i > int(max_iterations)) {
      break;
    }
      if(x2 + y2 > 4.0f) {
        escaped = true;
        break;
      }

    iterations++;
  }
    float res = float(iterations) / max_iterations;
outColor = vec4(vec3(res), 1.0);
  //outColor =  escaped ? vec4(vec3(1.0), 1.0) : vec4(vec3(0.0), 1.0);
}
`;

        let xStartValue = -1.0;
        let yStartValue = -1.0;
        let maxIterationsValue = 16.0;

        addEventListener("keydown", (e) => {
            switch (e.key) {
                case "o":
                    e.preventDefault();
                    maxIterationsValue++;
                    break;
                case "p": 
                    e.preventDefault();
                    maxIterationsValue--;
                    break;
            }
            console.log(maxIterationsValue);
        });


    function createShader(gl, type, source) {
            var shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
            if(success) {
                return shader;
            }
            console.log(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
        }

    function createProgram(gl, vertexShader, fragmentShader) {
            var program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            var success = gl.getProgramParameter(program, gl.LINK_STATUS);
            if(success) {
                return program;
            }
            console.log(gl.getProgramInfoLog());
            gl.deleteProgram();
        }

    let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);


    let program = createProgram(gl, vertexShader, fragmentShader);
    let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    let resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution")
    let maxIterationsLocation = gl.getUniformLocation(program, "max_iterations");
    let colorLocation = gl.getUniformLocation(program, "u_color");
    let startLocation = gl.getAttribLocation(program, "start_position");
//    let yStartLocation = gl.getUniformLocation(program, "y_start");

    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    var positions = [
              -1, -1,
              -1, 1,
              1, 1,
              -1, -1,
              1, 1,
              1, -1

    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);


    let vao = gl.createVertexArray();

    function drawScene() {

    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(positionAttributeLocation);
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset);


    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
        
// Pass in the canvas resolution so we can convert from
// pixels to clip space in the shader
gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1);
        gl.uniform1f(maxIterationsLocation, maxIterationsValue);
        gl.bindVertexArray(vao);
        var primitiveType = gl.TRIANGLES;
var offset = 0;
var count = 6;
gl.drawArrays(primitiveType, offset, count);

            requestAnimationFrame(drawScene);
        }

//        drawScene();
        requestAnimationFrame(drawScene);

