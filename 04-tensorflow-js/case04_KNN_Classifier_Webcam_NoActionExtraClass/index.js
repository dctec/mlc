// STEP 7 of tutorial. KNN Classifier
// https://codelabs.developers.google.com/codelabs/tensorflowjs-teachablemachine-codelab/index.html#6

// Create classifier (knnClassifier module is automatically included when loading knn-classifier through html scipt tag
//  -- returns KNNImageClassifier
const classifier = knnClassifier.create();

const webcamElement = document.getElementById('webcam');

let net;


async function app() {
  console.log('Loading mobilenet..');

  // Load the model.
  net = await mobilenet.load();
  console.log('Sucessfully loaded model');

  await setupWebcam();

  // Reads an image from the webcam and associates it with a specific class
  // index.
  const addExample = classId => {
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
    const activation = net.infer(webcamElement, 'conv_preds');

    // Pass the intermediate activation to the classifier.
    // API doc: https://github.com/tensorflow/tfjs-models/tree/master/knn-classifier
    //
    //    classifier.addExample(example: tf.Tensor, label: number|string)
    // where
    //    example: An example to add to the dataset, usually an activation from another model
    //    label: The label (class name) of the example
    classifier.addExample(activation, classId);
  };

  // When clicking a button, add an example for that class.
  document.getElementById('class-a').addEventListener('click', () => addExample(0));
  document.getElementById('class-b').addEventListener('click', () => addExample(1));
  document.getElementById('class-c').addEventListener('click', () => addExample(2));

  while (true) {
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

      const classes = ['A', 'B', 'C','No Action'];
      document.getElementById('console').innerText = `
        prediction: ${classes[result.classIndex]}\n
        probability: ${result.confidences[result.classIndex]}
      `;
    }

    await tf.nextFrame();
  }
}

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
