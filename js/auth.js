// ===============================
// SUPABASE CLIENT
// ===============================

const client = supabase.createClient(

  window.ENV.SUPABASE_URL,
  window.ENV.SUPABASE_ANON_KEY

);

// ===============================
// SIGNUP
// ===============================

async function signupUser(
  fullName,
  email,
  password,
  confirmPassword
){

  if(password !== confirmPassword){

    alert("Passwords do not match");
    return;

  }

  const { data, error } =
  await client.auth.signUp({

    email,
    password,

    options: {

      data: {
        full_name: fullName
      }

    }

  });

  if(error){

    alert(error.message);
    return;

  }

  alert("Account Created Successfully!");

  window.location.href = "login.html";

}

// ===============================
// LOGIN
// ===============================

async function loginUser(email,password){

  const { data, error } =
  await client.auth.signInWithPassword({

    email,
    password

  });

  if(error){

    alert(error.message);
    return;

  }

  alert("Login Successful!");

  window.location.href = "dashboard.html";

}

// ===============================
// CHECK USER
// ===============================

async function checkUser(){

  const {

    data: { user }

  } = await client.auth.getUser();

  if(!user){

    window.location.href = "login.html";

  }

  return user;

}

// ===============================
// LOGOUT
// ===============================

async function logoutUser(){

  await client.auth.signOut();

  window.location.href = "login.html";

}