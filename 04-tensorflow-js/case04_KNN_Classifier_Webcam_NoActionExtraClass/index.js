// [dctec] Practice ML tutorial
// 2019.08.31
// STEP 7 of tutorial. KNN Classifier with 'No Action' class
// https://codelabs.developers.google.com/codelabs/tensorflowjs-teachablemachine-codelab/index.html#7

// Q: What is an 'activation' and a 'promise'? I see those two mentioned often
// but not clearly understand the origin and meaning. -dctec
//

// knnClassifier.create()
//    Create classifier (knnClassifier module is automatically included when 
//    loading knn-classifier through html scipt tag
//      -- returns KNNImageClassifier
const classifier = knnClassifier.create();

const webcamElement = document.getElementById('webcam');
const MAX_SEQ_CAPTURE = 25;
const classes = ['A', 'B', 'C', 'No Action'];
const btn_train   =  document.getElementById("btn_train");
const btn_play    =  document.getElementById("btn_play");
const btn_sample_a = document.getElementById("btn_sample_A");
const btn_sample_b = document.getElementById("btn_sample_B");
const btn_sample_c = document.getElementById("btn_sample_C");
const console_div  = document.getElementById("console");
const console2_div  = document.getElementById("console2");
const top_banner_div  = document.getElementById("top_banner");
const append_yes = true;
const append_no = false;

let net;
let do_play;
let my_prediction;
let my_probability;
let cnt_capture = [0 , 0 , 0 ,0]; // 4 clases
let my_header = "";




async function app() {

  // function addExample(classId)
  //   Reads an image from the webcam and associates it with a specific class
  //   index.
  // Shortened (arrow function) syntax as per (https://babeljs.io/) and 
  // (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions#Shorter_functions)
  //  ...
  //    const addExample = classId => {
  // vs regular old fashion legible at all levels syntax:
  //    var addExample = function addExample(classId) {
  //
  var addExample = function addExample(classId) {
    // Get the intermediate activation of MobileNet 'conv_preds' and pass that
    // to the KNN classifier.
    for(i=0;i<MAX_SEQ_CAPTURE;i++){
      const activation = net.infer(webcamElement, 'conv_preds');
      // Pass the intermediate activation to the classifier.
      classifier.addExample(activation, classId);
      cnt_capture[classId]++;
      console2_div.innerHTML = `training count per <b>class</b> =`;
      for(j=0;j<classes.length;j++){
        console2_div.innerHTML += `<br>    <b>${classes[j]}</b> : ${cnt_capture[j]}`;
      } // for(j)
    } // for(i)
  }; //end of addExample function

  var wr_banner = function wr_banner(mymsg,my_append) {
    if (my_append) {
      top_banner_div.innerText += `\n${mymsg}`;
    } else {
      top_banner_div.innerText = `${mymsg}`;
    }
  };

  var btn_clicks = function btn_clicks(btnId) {
    btn_sample_a.disabled = true;
    btn_sample_b.disabled = true;
    btn_sample_c.disabled = true;
    do_play = false;

    switch (btnId) {
      case "sample_a":
        wr_banner("Capturing A...",append_no);
        addExample(0);
        btn_sample_a.disabled = true;
        btn_sample_b.disabled = false;
        wr_banner("Good job. Now sample B",append_yes);
        break;
      case "sample_b":
        wr_banner("Capturing B...\n",append_no);
        addExample(1);
        btn_sample_b.disabled = true;
        btn_sample_c.disabled = false;
        wr_banner("Good job. Now sample C",append_yes);
        break;
      case "sample_c":
        wr_banner("Capturing C...",append_no);
        addExample(2);
        btn_play.disabled = false;
        btn_sample_c.disabled = true;
        wr_banner("Good job. Now you can begin playing or you can train more",append_yes);
        break;
      case "train":
        for(k=0;k<3;k++){ addExample(3); }
        btn_play.disabled = true;
        btn_sample_a.disabled = false;
        do_play = false;
        wr_banner("Now, start by showing an object on camera and pressing the \"Sample A\" button",append_no);
        break;
      case "play":
        btn_sample_a.disabled = true;
        btn_sample_b.disabled = true;
        btn_sample_c.disabled = true;
        do_play = true;
        wr_banner("LET'S GUESS WHICH 3!!!",append_no);
        break;
    } // end switch


  }; // end btn_clicks function

  // disable the train button until camera is ready
  btn_train.disabled = true;
  wr_banner("Loading mobilenet..",append_no);
  console.log('Loading mobilenet..');

  // Load the model.
  // Notice that 'await' is only valid in an async function
  net = await mobilenet.load();
  wr_banner("MobileNet loaded OK",append_yes);
  console.log('Sucessfully loaded model');

  wr_banner("Loading webcam..",append_yes);
  console.log('Setting up webcam');
  await setupWebcam();
  wr_banner("WELCOME TO MY GUESS WHICH 3 GAME\n\nPlease begin by pressing the TRAIN button and waiting a few moments for background capture",append_no);
  console.log('Sucessfully set Webcam up');


  // enable train button and let user begin
  btn_train.disabled = false;


  // When clicking a button, add an example for that class.
  //     document.getElementById('class-a').addEventListener('click', function () { return addExample(0)});
  // OR short arrow form syntax:
  //     document.getElementById('class-a').addEventListener('click', () => addExample(0));
  //
  btn_sample_a.addEventListener('click', () => btn_clicks("sample_a"));
  btn_sample_b.addEventListener('click', () => btn_clicks("sample_b"));
  btn_sample_c.addEventListener('click', () => btn_clicks("sample_c"));
  btn_train.addEventListener('click', () => btn_clicks("train"));
  btn_play.addEventListener('click', () => btn_clicks("play"));

  /* [dctec] Research notes, trying to understand API and concept in general
  // Get the intermediate activation of MobileNet 'conv_preds' and pass that
  // to the KNN classifier.
  // (https://blog.understand.ai/tensorflow-js-a-painless-way-to-get-started-with-machine-learning-470c15f0f637)
  //  Inference (actual prediction)
  //    - The inference of an input also known as prediction of the class
  // API doc (https://github.com/tensorflow/tfjs-models/tree/master/mobilenet)
  // Getting embeddings
  //     You can also get the embedding of an image to do transfer learning. 
  //     The size of the embedding depends on the alpha (width) of the model.
  //          model.infer(img: tf.Tensor3D | ImageData | HTMLImageElement |
  //                      HTMLCanvasElement | HTMLVideoElement,
  //                      embedding=false
  //                     )
  //          where
  //              img: A tensor or an image element to make a classification on
  //              embedding: If true, it returns the embedding. Otherwise it
  //                          returns the 1000-dim unnormalized logits.
  // const activation = net.infer(webcamElement, 'conv_preds');

  // Pass the intermediate activation to the classifier.
  // API doc: https://github.com/tensorflow/tfjs-models/tree/master/knn-classifier
  //
  //    classifier.addExample(example: tf.Tensor, label: number|string)
  // where
  //    example: An example to add to the dataset, usually an activation from another model
  //    label: The label (class name) of the example
  // classifier.addExample(activation, classId);

  */


  while (true) {


    // If training is done and user selected to begin playing
    if (do_play) {
      // Get the activation from mobilenet from the webcam.
      const activation = net.infer(webcamElement, 'conv_preds');
      // Get the most likely class and confidences from the classifier module.
      const result = await classifier.predictClass(activation);
      //Can't figure out yet why the returned index (result.classIndex) does not 
      //match the index with the  highest probability. I can see on JS debugger 
      //for example:
      //    result.confidences={0:0 , 1:0 , 2:1 , 3:0 }
      //would mean class C (index 2), except that result.classIndex returns 0
      //and so, the image would be reported as class A instead of class C.
      //I've spent too much time on this. So, instead, for now use the ".label" 
      //object also returned by the predictClass method. That does match.
      my_prediction = classes[result.label];
      my_probability = result.confidences[result.label];

      // Set header
      if (result.label == 3) {
        // If class = "No action"
         my_header="...I am waiting for you take some action and let me predict the classification of an object\n";
       } else {
         my_header="Matching...\n"
       } // endif result

        // Print classification and probability
        console_div.innerText = `
            ${my_header}
            prediction: ${my_prediction}\n
            probability: ${my_probability}
        `;
        // wait before moving to next frame and updating text on screen or else
        // the text could change so fast and be annoying to user
        await sleep(1000);

    } // endif do_play

    await tf.nextFrame();

  } // while
} // end app




async function setupWebcam() {
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator;
    navigator.getUserMedia = navigator.getUserMedia ||
        navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
        navigatorAny.msGetUserMedia;
    if (navigator.getUserMedia) {
      navigator.getUserMedia({video: true},
        stream => {
          webcamElement.srcObject = stream;
          webcamElement.addEventListener('loadeddata',  () => resolve(), false);
        },
        error => reject());
    } else {
      reject();
    }
  });
}




// function sleep
//   - input: milliseconds integer
//   From https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve,ms));
}



app();
