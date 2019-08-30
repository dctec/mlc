//https://codelabs.developers.google.com/codelabs/tensorflowjs-teachablemachine-codelab/index.html#3

let net;

// STEP 1 of tutorial
async function app() {
  console.log('Loading mobilenet..');

  // Load the model.
  net = await mobilenet.load();
  console.log('Sucessfully loaded model');

  // Make a prediction through the model on our image.
  const imgEl = document.getElementById('img');
  const result = await net.classify(imgEl);
  console.log(result);
}


app();
