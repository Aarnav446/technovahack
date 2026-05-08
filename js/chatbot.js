// chatbot.js

// ==========================
// ELEMENTS
// ==========================

const canvas = document.getElementById("board");

const ctx = canvas.getContext("2d");

const colorPicker = document.getElementById("colorPicker");

const brushSize = document.getElementById("brushSize");

const clearBoard = document.getElementById("clearBoard");

const resetBoard = document.getElementById("resetBoard");

const sendBtn = document.getElementById("sendBtn");

const aiMessages = document.getElementById("aiMessages");

const logoutBtn = document.getElementById("logoutBtn");

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

ctx.lineCap = "round";

ctx.lineJoin = "round";

canvas.addEventListener("mousedown", startDraw);

canvas.addEventListener("mousemove", draw);

canvas.addEventListener("mouseup", stopDraw);

canvas.addEventListener("mouseleave", stopDraw);

function startDraw(e){

  drawing = true;

  ctx.beginPath();

  ctx.moveTo(e.offsetX, e.offsetY);
}

function draw(e){

  if(!drawing) return;

  ctx.strokeStyle = colorPicker.value;

  ctx.lineWidth = brushSize.value;

  ctx.lineTo(e.offsetX, e.offsetY);

  ctx.stroke();
}

function stopDraw(){

  drawing = false;
}

// ==========================
// CLEAR
// ==========================

clearBoard.addEventListener("click", ()=>{

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

function addMessage(message){

  const div = document.createElement("div");

  div.className =
  "bg-white/5 border border-white/10 rounded-2xl p-4 whitespace-pre-wrap leading-relaxed";

  div.innerText = message;

  aiMessages.appendChild(div);

  aiMessages.scrollTop = aiMessages.scrollHeight;
}

// ==========================
// GEMINI AI
// ==========================

const GEMINI_API_KEY = window.CONFIG.GEMINI_API_KEY;

async function askAI(){

  addMessage("Analyzing your whiteboard...");

  try{

    const image = canvas.toDataURL("image/png");

    const base64 = image.split(",")[1];

    const response = await fetch(

      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${window.CONFIG.GEMINI_API_KEY}`,

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

                  inline_data:{

                    mime_type:"image/png",

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
// BUTTON
// ==========================

sendBtn.addEventListener("click", askAI);

// ==========================
// GSAP
// ==========================

gsap.from("nav",{

  y:-100,

  opacity:0,

  duration:1
});

gsap.from(".glass",{

  y:40,

  opacity:0,

  stagger:0.1,

  duration:1
});