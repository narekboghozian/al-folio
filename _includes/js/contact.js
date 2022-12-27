// Global Variables

var max_email = 256;
var min_name = 2;
var max_name = 256;
var min_msg = 0;
var max_msg = 1024;
var char_left_warn = 400;


// Functions

function enableForm() {
  const sub = document.getElementById("submit_button");
  sub.disabled = false;
  sub.classList.remove("clicked");
  document.getElementById("name").disabled = false;
  document.getElementById("email").disabled = false;
  document.getElementById("message").disabled = false;
}
function disableForm() {
  const sub = document.getElementById("submit_button");
  sub.disabled = true;
  sub.classList.add("clicked");
  document.getElementById("name").disabled = true;
  document.getElementById("email").disabled = true;
  document.getElementById("message").disabled = true;
}
function getInputs() {
  var inputs = {
    'name': '',
    'email': '' ,
    'message': ''
  };
  for (var input in inputs) {
    if (inputs.hasOwnProperty(input)) {
      inputs[input] = document.getElementById(input).value;
    }
  }
  return inputs;
}
function validateInputs(inputs) {
  // return true;
  const validateEmail = (email) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  };
  var result = {
    'name': false,
    'email': false,
    'message': false
  }
  result['email'] = (validateEmail(inputs['email']) && inputs['email'].length <= max_email);
  result['name'] = (inputs['name'].length >= min_name && inputs['name'].length <= max_name);
  result['message'] = (inputs['message'].length >= min_msg && inputs['message'].length <= max_msg);
  var passed = true;
  for (var item in inputs) {
    if (inputs.hasOwnProperty(item)) {
      var element = document.getElementById(item);
      if (result[item]){
        element.classList.remove('invalid');
      } else {
        element.classList.add('invalid');
        passed = false;
      }
    }
  }
  return passed;
}
function enableLoadingScreen() {
  const statusDiv = document.getElementById('status');
  statusDiv.classList.add('showing');
}
function disableLoadingScreen() {
  const statusDiv = document.getElementById('status');
  statusDiv.classList.remove('showing');
  const status_span = document.getElementById('status_span');
  if (status_span.classList.contains('fail')){
    status_span.classList.remove('fail');
  }
  if (status_span.classList.contains('pass')){
    status_span.classList.remove('pass');
  }
  status_span.innerHTML = "Sending Message";
}
function serialize(obj) {
  var str = [];
  for(var p in obj)
     str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
  return str.join("&");
}
async function sendMessage(inputs) {
  let params = serialize(inputs);
  let url = "{{ page.api_link }}" + "?" + params;
  let response = await fetch(url);
  let status = response['status'];
  for (var i = 0; i < 5; i++) {
    if (status != 200) {
      response = await fetch(url);
      status = response['status'];
    } else {
      break;
    }
  }
  return status;
}
function displayPass() {
  const status_span = document.getElementById('status_span');
  status_span.classList.add('pass');
  if (status_span.classList.contains('fail')){
    status_span.classList.remove('fail');
  }
  status_span.innerHTML = 'Message Sent';

  const status_button = document.getElementById('status_button');
  status_button.classList.remove('hidden');
  status_button.innerHTML = "Return to Site";
  status_button.addEventListener('click', function() {
    console.log('hi');
    window.location.href = "/"
  });
}
function displayFail(value) {
  const status_span = document.getElementById('status_span');
  status_span.classList.add('fail');
  if (status_span.classList.contains('pass')){
    status_span.classList.remove('pass');
  }
  status_span.innerHTML = 'Message Failed to Send';

  const status_button = document.getElementById('status_button');
  status_button.classList.remove('hidden');
  status_button.innerHTML = "Return to Form";
  status_button.addEventListener('click', function() {
    disableLoadingScreen();
    enableForm();
  });
}
function displayPassOrFail(value) {
  var pass = false;
  if (value == 200) {
    displayPass();
  }
  else{
    displayFail(value);
  }
}
function checkMessageCharacters() {
  const msg = document.getElementById("message");
  const chr = document.getElementById('charlim');
  var msg_len = new Blob([msg.value]).size;
  console.log(msg_len);
  var warn = "Characters remaining: " + (max_msg - msg_len).toString() + " / " + max_msg.toString();
  console.log(warn);
  if (msg_len < max_msg - char_left_warn) {
    // hidden
    if (!chr.classList.contains('hidden')){
      chr.classList.add('hidden');
      return null
    }
  } else if (msg_len <= max_msg){
    // white
    chr.innerHTML = warn;
    if (chr.classList.contains('hidden')){
      chr.classList.remove('hidden');
    }
    if (chr.classList.contains('char_red')){
      chr.classList.remove('char_red');
    }
  } else {
    // red
    chr.innerHTML = warn;
    if (chr.classList.contains('hidden')){
      chr.classList.remove('hidden');
    }
    if (!chr.classList.contains('char_red')){
      chr.classList.add('char_red');
    }
  }
}
function formSubmit(event) {
  disableForm();
  var inputs = getInputs();
  if (!validateInputs(inputs)){enableForm(); return 0;}
  enableLoadingScreen();
  sendMessage(inputs).then(
    function(value) { // succeeded
      displayPassOrFail(value);
    },
    function(error) { // error'd
      displayPassOrFail(error);
    }
  );
}
enableForm();
const sub = document.getElementById("submit_button");
sub.addEventListener('click', formSubmit);
const msg = document.getElementById("message");
msg.addEventListener('input', checkMessageCharacters);
