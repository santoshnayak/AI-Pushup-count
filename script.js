let video = document.getElementById("video");
let model;
// let canvas = document.getElementById("canvas");
// let ctx = canvas.getContext("2d");
let windowHeight = window.outerHeight * 0.4;
let windowWidth = window.outerWidth - 100;

var targetCount = 10;
const detectorConfig = {
  modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
};

var upValue = 150;
var downValue = 130;

var threshHoldKneeAnkleDistance = 30;
let detector;

var canCountIncrease = false;
var countValue = 0;
const setupCamera = () => {
  navigator.mediaDevices
    .getUserMedia({
      video: { width: windowWidth, height: windowHeight },
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
      // document.getElementById("targetCount").innerHTML = targetCount;
    });
};

const detectPose = async () => {
  // alert(document.getElementById("video").offsetWidth)
  const poses = await detector.estimatePoses(document.querySelector("video"));

  // const predictions = await model.estimateHands(document.querySelector("video"));
  // console.log(poses);

  // temporary area
  if (poses.length) {
    let right_shoulder = poses[0].keypoints.find(
      (x) => x.name == "right_shoulder"
    );
    let right_wrist = poses[0].keypoints.find((x) => x.name == "right_wrist");

    let right_knee = poses[0].keypoints.find((x) => x.name == "right_knee");
    let right_ankle = poses[0].keypoints.find((x) => x.name == "right_ankle");

    if (
      right_shoulder.score > 0.5 &&
      right_wrist.score > 0.5 &&
      right_knee.score > 0.5 &&
      right_ankle.score > 0.5
    ) {
      // var a = right_shoulder.x - right_wrist.x;
      // var b = right_shoulder.y - right_wrist.y;

      // var c = Math.sqrt(a * a + b * b);

      var rightShoulderAndWristDistance = distanceBetweenTwo(
        right_shoulder.x,
        right_wrist.x,
        right_shoulder.y,
        right_wrist.y
      );

      var rightKneeAndAnkleDistance = distanceBetweenTwo(
        right_knee.x,
        right_ankle.x,
        right_knee.y,
        right_ankle.y
      );
      // document.getElementById(
      //   "rightShoulderCoordinaye"
      // ).innerHTML = rightShoulderAndWristDistance;
 
      if (
        rightShoulderAndWristDistance > upValue &&
        rightKneeAndAnkleDistance < threshHoldKneeAnkleDistance
      ) {
        document.getElementById("positionValue").innerHTML = "UP";
        canCountIncrease = true;
      } else if (rightShoulderAndWristDistance < downValue) {
        document.getElementById("positionValue").innerHTML = "DOWN";

        if (canCountIncrease) {
          countValue = countValue + 1;
          document.getElementById("countValue").innerHTML = countValue;

          if (countValue >= targetCount) {
            //target achieved
            console.log(true);

            document.getElementById("targetAchieve").innerHTML =
              "🎂 Goal Achieved 🎂 ";
          }
          canCountIncrease = false;
        }
      }
    }
  }

  // ctx.drawImage(video, 0, 0, windowWidth, windowHeight);

  // poses.forEach((eachPose) => {
  //   ctx.beginPath();
  //   ctx.lineWidth = "4";
  //   ctx.strokeStyle = "blue";

  //   ctx.fillStyle = "red";
  //   eachPose.keypoints.forEach((key, index) => {
  //     ctx.fillRect(key.x, key.y, 5, 5);
  //   });

  //   ctx.stroke();
  // });
};

setupCamera();
video.addEventListener("loadeddata", async () => {
  // document.getElementById("video").offsetWidth, document.getElementById("video").offsetHeight

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  if (urlParams.get("goal")) {
    targetCount = urlParams.get("goal");
  }
  document.getElementById("targetCount").innerHTML = targetCount;

  // console.log("queryString", targetCount);

  // canvas.width = document.getElementById("video").offsetWidth;
  // canvas.height = document.getElementById("video").offsetHeight;
  // canvas.setAttribute("width", windowWidth);
  // canvas.setAttribute("height", windowHeight);


  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    detectorConfig
  );

  document.getElementById("loadingText").innerHTML =
    "Please stand in front of camera";



  setInterval(detectPose, 30);
});

function sendMessagetoFlutter(value) {
  console.log(value);
  // window.CHANNEL_NAME.postMessage('Hello from JS');
}

function distanceBetweenTwo(x2, x1, y2, y1) {
  var a = x2 - x1;
  var b = y2 - y1;

  return Math.sqrt(a * a + b * b);
}
