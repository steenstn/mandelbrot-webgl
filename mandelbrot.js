
    
let canvas = document.querySelector("#c");
let gl = canvas.getContext("webgl2");
if(!gl) {
    alert("WebGL2 not supported");
}


var vertexShaderSource = `#version 300 es

precision highp float;
in vec2 a_position;
uniform vec2 u_resolution;
uniform float zoom;
uniform float x_start;
uniform float y_start;
out vec4 v_color;
in vec2 start_position;
out vec2 startz;

void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_color = vec4(gl_Position.x + x_start, gl_Position.y + y_start, 0.0, 1.0) * zoom;
}
`;
 
var fragmentShaderSource = `#version 300 es
 
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

in vec4 v_color;
in vec2 startz;
 
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
  
//  outColor =  escaped ? vec4(vec3(1.0), 1.0) : vec4(vec3(0.0), 1.0);
}
`;

        let xStartValue = -0.5;
        let yStartValue = 0.0;
        let zoomValue = 1.0;
        let maxIterationsValue = 1000.0;

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
                case "q":
                    e.preventDefault();
                    zoomValue+=0.01;
                    break;
                case "e":
                    e.preventDefault();
                    zoomValue-=0.01;
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    xStartValue-=0.1;
                    break;

                case "ArrowRight":
                    e.preventDefault();
                    xStartValue+=0.1;
                    break;

                case "ArrowUp":
                    e.preventDefault();
                    yStartValue+=0.1;
                    break;

                case "ArrowDown":
                    e.preventDefault();
                    yStartValue-=0.1;
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
    let startLocation = gl.getUniformLocation(program, "start_position");
    let zoomLocation = gl.getUniformLocation(program,"zoom");
    let xStartLocation = gl.getUniformLocation(program, "x_start");
    let yStartLocation = gl.getUniformLocation(program, "y_start");

    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    var positions = [
              -2, -2,
              -2, 2,
              2, 2,
              -2, -2,
              2, 2,
              2, -2

    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);


    let vao = gl.createVertexArray();

    function drawScene() {

        console.log(xStartValue);
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
    //    gl.viewport(0, 0, 200, 200);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
            
    // Pass in the canvas resolution so we can convert from
    // pixels to clip space in the shader
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(startLocation, xStartValue, yStartValue);
    //    gl.bindAttribLocation(program, startLocation, xStartValue, yStartValue);
        gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1);
        gl.uniform1f(maxIterationsLocation, maxIterationsValue);
        gl.uniform1f(zoomLocation, zoomValue);
        gl.uniform1f(xStartLocation, xStartValue);
        gl.uniform1f(yStartLocation, yStartValue);
        gl.bindVertexArray(vao);
        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = 6;
        gl.drawArrays(primitiveType, offset, count);

        requestAnimationFrame(drawScene);
    }

//        drawScene();
        requestAnimationFrame(drawScene);

