// STEP 7 of tutorial. KNN Classifier with 'No Action' class
// https://codelabs.developers.google.com/codelabs/tensorflowjs-teachablemachine-codelab/index.html#7

// Q: What is an 'activation' and a 'promise'? I see those two mentioned often
// but not clearly understand the origin and meaning. -dctec
//
// Q: What's the difference between .infer and .classify . I read that .infer 
// is used in transfer learning but I need more info on the differences and 
// when to use each. -dctec

// knnClassifier.create()
//    Create classifier (knnClassifier module is automatically included when 
//    loading knn-classifier through html scipt tag
//      -- returns KNNImageClassifier
const classifier = knnClassifier.create();

const webcamElement = document.getElementById('webcam');

let net;
let cnt_capture=[];
let my_prediction;
let my_probability;
let status_playing=false;
const MAX_CAPTURE_SEQ_CNT = 15;
const classes = ['A', 'B', 'C','None of the above'];
const btn_train   =  document.getElementById("btn_train");
const btn_play    =  document.getElementById("btn_play");
const btn_sample_A = document.getElementById("btn_sample_A");
const btn_sample_B = document.getElementById("btn_sample_B");
const btn_sample_C = document.getElementById("btn_sample_C");
const console_div  = document.getElementById("console");
const console2_div  = document.getElementById("console2");


// function sleep
//   - input: milliseconds integer
//   From https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve,ms));
}

async function app() {

  console.log('Loading mobilenet..');

  net = await mobilenet.load();
  // Notice that 'await' is only valid in an async function

  console.log('Sucessfully loaded model');

  console.log('Setting up webcam');
  await setupWebcam();
  console.log('Sucessfully set Webcam up');

  // init cnt array to keep track of captured samples per classId
  
  for(i=0;i<classes.length;i++){
    cnt_capture[i]=0;
  }
   

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

  //debugger

    btn_train.addEventListener('click', function (event) {
      btn_play.disabled = false;
      btn_sample_A.disabled = false;
      btn_sample_B.disabled = true;
      btn_sample_C.disabled = true;
      status_playing = false;
    });
      

    btn_play.addEventListener('click', function (event) { 
      btn_sample_A.disabled = true;
      btn_sample_B.disabled = true;
      btn_sample_C.disabled = true;
      status_playing = true;
      return doClassify();
    });

  while(status_playing == false) {
    btn_sample_A.addEventListener('click', function () { 
      btn_sample_A.disabled = true;
      btn_sample_B.disabled = false;
      btn_sample_C.disabled = true;
      status_playing = false;
      console.log('btn_a')
      return addExample(0)
    });

  btn_sample_B.addEventListener('click', function (event) { 
      btn_sample_A.disabled = true;
      btn_sample_B.disabled = true;
      btn_sample_C.disabled = false;
      status_playing = false;
      return addExample(1)
  });

  btn_sample_C.addEventListener('click', function (event) { 
      btn_sample_A.disabled = true;
      btn_sample_B.disabled = true;
      btn_sample_C.disabled = true;
      status_playing = false;
      return addExample(2)
  });
  

    
  /*
  // When clicking a button, add an example for that class.
  document.getElementById('class-a').addEventListener('click', function () { return addExample(0)});
  // OR short arrow form syntax:
  // document.getElementById('class-a').addEventListener('click', () => addExample(0));
  document.getElementById('class-b').addEventListener('click', () => addExample(1));
  document.getElementById('class-c').addEventListener('click', () => addExample(2));
  */

  // If no category button is clicked, sample background into 'no action' category 
  // meanwhile
  await tf.nextFrame();
  var my_skip;
  if (my_skip < 100000) {
    ///await sleep(3000);
    await addExample(3);
    my_skip++;
  } else {
    my_skip = 0;
  }

  }
}


  //var addExample = function addExample(classId) {
function addExample(classId) {
    var activation;
    var i;

    //
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


    // For each click, capture N sequential images from input. So, that the
    // the classId training converges quickly on this image. Otherwise it takes
    // 3 clicks before converging (0.33 , 0.66, 1)
    for(i=0;i<MAX_CAPTURE_SEQ_CNT;i++){
        //activation = net.infer(webcamElement, 'conv_preds');
        //classifier.addExample(activation, classId);
        cnt_capture[classId]+=1;

        console2_div.innerText = ``;
        for(j=0;j<classes.length;j++){
          console2_div.innerText += `
            training count class ${classes[j]} : ${cnt_capture[j]}\n
          `;
        } // for j
    } // for i
} //function addExample


async function doClassify() {

  while(status_playing == true) {
    // Get the total number of classes 
    // API doc:
    //    classifier.getNumClasses(): number
    if (classifier.getNumClasses() > 0) {

        // Get the activation from mobilenet from the webcam.
        const activation = net.infer(webcamElement, 'conv_preds');

        // Get the most likely class and confidences from the classifier module.
        // API doc:
        // Making a prediction (https://github.com/tensorflow/tfjs-models/tree/master/knn-classifier)
        //    classifier.predictClass(input: tf.Tensor, k=3): Promise<{
        //      label:string, classIndex:number, confidences: {[classId: number]: number}}>;
        // where
        //   input: An example to make a prediction on, usually an activation from another model.
        //   k: The K value to use in K-nearest neighbors. The algorithm will first find the K nearest 
        //     examples from those it was previously shown, and then choose the class that appears the 
        //     most as the final prediction for the input example. Defaults to 3. If examples < k, k = examples.
        // Returns an object where:
        //   label: the label (class name) with the most confidence.
        //   classIndex: the 0-based index of the class (for backwards compatibility).
        //   confidences: maps each label to their confidence score.
        const result = await classifier.predictClass(activation);


        my_prediction = classes[result.classIndex];
        my_probability = result.confidences[result.classIndex];


        if (result.classIndex == 3) {
            console_div.innerText = `
              ...I am waiting for you take some action and let me predict the classification of an object\n
            `;
            // wait before moving to next frame and updating text on screen or else
            // the text could change so fast and be annoying to user
            //await sleep(3000);
         } else {
            console_div.innerText = `
                prediction: ${my_prediction}\n
                probability: ${my_probability}
            `;
         } //endif 

    } // if gerNumClasses


    // tf.nextFrame() returns a promise that resolve when a requestAnimationFrame has 
    // completed (https://js.tensorflow.org/api/latest/#nextFrame)
    await tf.nextFrame();

  } // while

}  //function Classify


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


app();
