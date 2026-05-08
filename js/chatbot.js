// ==========================
// ELEMENTS
// ==========================

const canvas = document.getElementById("board");

const ctx = canvas.getContext("2d");

const colorPicker = document.getElementById("colorPicker");

const brushSize = document.getElementById("brushSize");

const drawTool = document.getElementById("drawTool");

const eraserTool = document.getElementById("eraserTool");

const textTool = document.getElementById("textTool");

const clearBoard = document.getElementById("clearBoard");

const resetBoard = document.getElementById("resetBoard");

const sendBtn = document.getElementById("sendBtn");

const aiMessages = document.getElementById("aiMessages");

const logoutBtn = document.getElementById("logoutBtn");

const userPrompt =
document.getElementById("userPrompt");

const sendTextBtn =
document.getElementById("sendTextBtn");

// ==========================
// SUPABASE
// ==========================

const supabaseClient = supabase.createClient(

  window.CONFIG.SUPABASE_URL,

  window.CONFIG.SUPABASE_ANON_KEY

);

// ==========================
// LOGOUT
// ==========================

logoutBtn.addEventListener("click", async ()=>{

  await supabaseClient.auth.signOut();

  window.location.href = "login.html";

});

// ==========================
// CANVAS SIZE
// ==========================

function resizeCanvas(){

  canvas.width = canvas.offsetWidth;

  canvas.height = canvas.offsetHeight;

  ctx.fillStyle = "#0a0a0a";

  ctx.fillRect(0,0,canvas.width,canvas.height);

}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);

// ==========================
// DRAWING
// ==========================

let drawing = false;

let currentTool = 'draw';

ctx.lineCap = "round";

ctx.lineJoin = "round";

canvas.addEventListener("mousedown", startDraw);

canvas.addEventListener("mousemove", draw);

canvas.addEventListener("mouseup", stopDraw);

canvas.addEventListener("mouseleave", stopDraw);

// MOBILE SUPPORT

canvas.addEventListener("touchstart", handleTouchStart);

canvas.addEventListener("touchmove", handleTouchMove);

canvas.addEventListener("touchend", stopDraw);

function startDraw(e){

  drawing = true;

  if(currentTool === 'text'){

    const text = prompt("Enter text to add:");

    if(text){

      ctx.fillStyle = colorPicker.value;

      ctx.font = `${brushSize.value * 5}px Arial`;

      ctx.fillText(text, e.offsetX, e.offsetY);

    }

    drawing = false;

    return;

  }

  ctx.beginPath();

  ctx.moveTo(e.offsetX, e.offsetY);

}

function draw(e){

  if(!drawing || currentTool === 'text') return;

  if(currentTool === 'erase'){

    ctx.globalCompositeOperation = 'destination-out';

    ctx.lineWidth = brushSize.value * 2;

  } else {

    ctx.globalCompositeOperation = 'source-over';

    ctx.strokeStyle = colorPicker.value;

    ctx.lineWidth = brushSize.value;

  }

  ctx.lineTo(e.offsetX, e.offsetY);

  ctx.stroke();

}

function stopDraw(){

  drawing = false;

}

function handleTouchStart(e){

  e.preventDefault();

  const rect = canvas.getBoundingClientRect();

  const touch = e.touches[0];

  const x = touch.clientX - rect.left;

  const y = touch.clientY - rect.top;

  if(currentTool === 'text'){

    const text = prompt("Enter text to add:");

    if(text){

      ctx.fillStyle = colorPicker.value;

      ctx.font = `${brushSize.value * 5}px Arial`;

      ctx.fillText(text, x, y);

    }

    return;

  }

  drawing = true;

  ctx.beginPath();

  ctx.moveTo(x,y);

}

function handleTouchMove(e){

  e.preventDefault();

  if(!drawing || currentTool === 'text') return;

  const rect = canvas.getBoundingClientRect();

  const touch = e.touches[0];

  const x = touch.clientX - rect.left;

  const y = touch.clientY - rect.top;

  if(currentTool === 'erase'){

    ctx.globalCompositeOperation = 'destination-out';

    ctx.lineWidth = brushSize.value * 2;

  } else {

    ctx.globalCompositeOperation = 'source-over';

    ctx.strokeStyle = colorPicker.value;

    ctx.lineWidth = brushSize.value;

  }

  ctx.lineTo(x,y);

  ctx.stroke();

}

// ==========================
// TOOLS
// ==========================

function setActiveTool(tool){

  currentTool = tool;

  drawTool.classList.remove('active');

  eraserTool.classList.remove('active');

  textTool.classList.remove('active');

  if(tool === 'draw') drawTool.classList.add('active');

  if(tool === 'erase') eraserTool.classList.add('active');

  if(tool === 'text') textTool.classList.add('active');

  // Update cursor

  if(tool === 'erase'){

    canvas.style.cursor = 'crosshair';

  } else if(tool === 'text'){

    canvas.style.cursor = 'text';

  } else {

    canvas.style.cursor = 'crosshair';

  }

}

drawTool.addEventListener('click', () => setActiveTool('draw'));

eraserTool.addEventListener('click', () => setActiveTool('erase'));

textTool.addEventListener('click', () => setActiveTool('text'));

// Set initial active

setActiveTool('draw');

// ==========================
// CLEAR
// ==========================

clearBoard.addEventListener("click", ()=>{

  ctx.globalCompositeOperation = 'source-over';

  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = "#0a0a0a";

  ctx.fillRect(0,0,canvas.width,canvas.height);

});

// ==========================
// RESET
// ==========================

resetBoard.addEventListener("click", ()=>{

  location.reload();

});

// ==========================
// ADD MESSAGE
// ==========================

function addMessage(message, type="ai"){

  const div = document.createElement("div");

  div.className =
  type === "user"
  ? "message-user"
  : "message-ai";

  div.innerText = message;

  aiMessages.appendChild(div);

  aiMessages.scrollTop = aiMessages.scrollHeight;

}

// ==========================
// IMAGE AI
// ==========================

async function askAI(){

  addMessage("Analyzing your whiteboard...");

  try{

    const image = canvas.toDataURL("image/png");

    const base64 = image.split(",")[1];

    const response = await fetch(

      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${window.CONFIG.GEMINI_API_KEY}`,

      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body: JSON.stringify({

          contents:[

            {

              parts:[

                {

                  text:
                  "Analyze this handwritten question carefully and solve it step-by-step for a student."

                },

                {

                  inlineData:{

                    mimeType:"image/png",

                    data:base64

                  }

                }

              ]

            }

          ]

        })

      }

    );

    const data = await response.json();

    console.log(data);

    if(data.error){

      addMessage("Gemini Error: " + data.error.message);

      return;

    }

    let result =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if(!result){

      result = "AI could not understand the drawing.";

    }

    addMessage(result);

  }

  catch(error){

    console.error(error);

    addMessage("Failed to connect with Gemini AI.");

  }

}

// ==========================
// TEXT AI
// ==========================

async function askTextAI(){

  const prompt = userPrompt.value.trim();

  if(!prompt) return;

  addMessage(prompt, "user");

  userPrompt.value = "";

  try{

    const response = await fetch(

      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${window.CONFIG.GEMINI_API_KEY}`,

      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body: JSON.stringify({

          contents:[

            {

              parts:[

                {

                  text: prompt

                }

              ]

            }

          ]

        })

      }

    );

    const data = await response.json();

    console.log(data);

    if(data.error){

      addMessage("Gemini Error: " + data.error.message);

      return;

    }

    let result =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if(!result){

      result = "No AI response.";

    }

    addMessage(result);

  }

  catch(error){

    console.error(error);

    addMessage("Failed to connect.");

  }

}

// ==========================
// BUTTONS
// ==========================

sendBtn.addEventListener(
  "click",
  askAI
);

sendTextBtn.addEventListener(
  "click",
  askTextAI
);

userPrompt.addEventListener(
  "keypress",
  (e)=>{

    if(e.key === "Enter"){

      askTextAI();

    }

  }
);

// ==========================
// GSAP
// ==========================

if(typeof gsap !== "undefined"){

  gsap.from("nav",{

    y:-100,

    opacity:0,

    duration:1

  });

  gsap.from(".glass",{

    y:40,

    opacity:0,

    stagger:0.1,

    duration:0.8,

    clearProps:"all"

  });

}