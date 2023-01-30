import "./App.css"
import { FaceMesh } from "@mediapipe/face_mesh"
import * as Facemesh from "@mediapipe/face_mesh"
import * as cam from "@mediapipe/camera_utils"
import Webcam from "react-webcam"
import React, { useRef, useEffect, useState } from "react"

function App() {
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)
  const canvasRef1 = useRef(null)

  var camera = null

  //기준값 스냅
  var land = []
  var landmarkCaptures = []
  var captureDistance = 0
  var results1 = null

  //스케일 변수
  var captuer0to152Distance = 0

  //평균 값
  var aver = 0
  var averSum = 0
  var averCount = 0
  var minimum = 100000

  const connect = window.drawConnectors

  const onResults = async (results) => {
    results1 = results
    //Setting H,W of canvas
    canvasRef.current.width = webcamRef.current.video.videoWidth
    canvasRef.current.height = webcamRef.current.video.videoHeight

    const canvasElement = canvasRef.current
    const canvasCtx = canvasElement.getContext("2d")
    canvasCtx.save()

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height)
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    )
    if (results.multiFaceLandmarks) {
      for (const landmarks of results.multiFaceLandmarks) {
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_TESSELATION, {
          color: "#C0C0C070",
          lineWidth: 1,
        })
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYE, {
          color: "#FF3030",
          lineWidth: 1,
        })
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYEBROW, {
          color: "#FF3030",
          lineWidth: 1,
        })
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_IRIS, {
          color: "#FF3030",
          lineWidth: 1,
        })
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYE, {
          color: "#30FF30",
          lineWidth: 1,
        })
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYEBROW, {
          color: "#30FF30",
          lineWidth: 1,
        })
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_IRIS, {
          color: "#30FF30",
          lineWidth: 1,
        })
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_FACE_OVAL, {
          color: "#E0E0E0",
          lineWidth: 1,
        })
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_LIPS, {
          color: "#E0E0E0",
          lineWidth: 1,
        })
      }

      //console.log(results)
      land = results.multiFaceLandmarks[0]
      if (
        landmarkCaptures !== undefined &&
        landmarkCaptures !== null &&
        landmarkCaptures.length !== 0 &&
        land !== undefined
      ) {
        const distance_0 = land

        // // console.log("**************************")
        // // console.log("[0]", distance_0[0])
        // // console.log("[152]", distance_0[152])
        // // console.log("[10]", distance_0[10])
        // // console.log("[234]", distance_0[234])
        // // console.log("[454]", distance_0[454])
        // // console.log("**************************")

        /**
         * 1. 스케일 작업
         */
        const _0to152Distance = calculateScaleDistance(
          distance_0[10],
          distance_0[152]
        )

        const scale = _0to152Distance / captuer0to152Distance
        for (let i = 0; i < distance_0.length; i++) {
          distance_0[i].x = distance_0[i].x / scale
          distance_0[i].y = distance_0[i].y / scale
          distance_0[i].z = distance_0[i].z / scale
        }

        // const _0to152Distancenew = calculateScaleDistance(
        //   distance_0[10],
        //   distance_0[152]
        // )

        // const test =
        //   captuer0to152Distance * 100000 - _0to152Distancenew * 100000
        // console.log("1**************************1")
        // console.log("1", captuer0to152Distance * 100000)
        // console.log("2", _0to152Distancenew * 100000)
        // console.log("diff", test)
        // console.log("1**************************1")

        // // distance_0[10].x = distance_0[10].x / scale
        // // distance_0[10].y = distance_0[0].y / scale
        // // distance_0[10].z = distance_0[10].z / scale
        // // distance_0[152].x = distance_0[152].x / scale
        // // distance_0[152].y = distance_0[152].y / scale
        // // distance_0[152].z = distance_0[152].z / scale

        // // console.log("1**************************1")
        // // console.log("[0]", distance_0[0])
        // // console.log("[152]", distance_0[152])
        // // console.log("[10]", distance_0[10])
        // // console.log("[234]", distance_0[234])
        // // console.log("[454]", distance_0[454])
        // // console.log("1**************************1")

        /**
         * 2. 0번째 인덱스 거리 조정
         */
        const diffX_0 = landmarkCaptures[10].x - distance_0[10].x
        const diffY_0 = landmarkCaptures[10].y - distance_0[10].y
        const diffZ_0 = landmarkCaptures[10].z - distance_0[10].z
        for (let i = 0; i < land.length - 1; i++) {
          distance_0[i].x = distance_0[i].x + diffX_0
          distance_0[i].y = distance_0[i].y + diffY_0
          distance_0[i].z = distance_0[i].z + diffZ_0
        }

        // // distance_0[10].x = distance_0[10].x + diffX_0
        // // distance_0[10].y = distance_0[10].y + diffY_0
        // // distance_0[10].z = distance_0[10].z + diffZ_0
        // // distance_0[152].x = distance_0[152].x + diffX_0
        // // distance_0[152].y = distance_0[152].y + diffY_0
        // // distance_0[152].z = distance_0[152].z + diffZ_0

        // console.log("2**************************2")
        // console.log("[0]", distance_0[0])
        // console.log("[152]", distance_0[152])
        // console.log("[10]", distance_0[10])
        // console.log("[234]", distance_0[234])
        // console.log("[454]", distance_0[454])
        // console.log("2**************************2")

        // const _0to152Distance1 = calculateScaleDistance(
        //   landmarkCaptures[10],
        //   distance_0[10]
        // )

        // const _0to152Distance2 = calculateScaleDistance(
        //   landmarkCaptures[152],
        //   distance_0[152]
        // )

        // console.log("1", _0to152Distance1, "  ", _0to152Distance2)

        let distance = 0

        for (let i = 0; i < distance_0.length - 1; i++) {
          distance += calculateScaleDistance(landmarkCaptures[i], distance_0[i])
        }

        // distance += calculateScaleDistance(landmarkCaptures[10], distance_0[10])
        // distance += calculateScaleDistance(
        //   landmarkCaptures[152],
        //   distance_0[152]
        // )
        // distance += calculateScaleDistance(landmarkCaptures[8], distance_0[8])
        // distance += calculateScaleDistance(
        //   landmarkCaptures[234],
        //   distance_0[234]
        // )
        // distance += calculateScaleDistance(
        //   landmarkCaptures[454],
        //   distance_0[454]
        // )

        if (minimum >= distance) {
          minimum = distance
          console.log("distance", distance)
        }

        // const ab = (a / b) * 100
        // //console.log("new", ab)

        // if (averCount < 10) {
        //   averSum = averSum + ab
        //   averCount = averCount + 1
        //   aver = averSum / averCount
        // } else if (averCount == 10) {
        //   console.log("aver 10 ", aver)
        //   averCount = averCount + 1
        // }
        //console.log("averSum", averSum)
        // console.log("averCount", averCount)

        // /**
        //  * 3. 거리 합산
        //  */
        // if (distance_0 !== undefined && captureDistance !== 0) {
        //   let distance = 0
        //   // for (let i = 0; i < distance_0.length - 1; i++) {
        //   //   distance += euclideanDistance3D(distance_0[0], distance_0[i + 1])
        //   // }
        //   distance += euclideanDistance3D(distance_0[234], distance_0[454])
        //   distance += euclideanDistance3D(distance_0[234], distance_0[152])
        //   distance += euclideanDistance3D(distance_0[234], distance_0[10])
        //   distance += euclideanDistance3D(distance_0[454], distance_0[152])
        //   distance += euclideanDistance3D(distance_0[454], distance_0[10])
        //   const diffDistance = absDistance(captureDistance, distance)
        //   // console.log("3**************************3")
        //   // console.log("diffDistance", diffDistance)
        //   // console.log("captureDistance", captureDistance)
        //   // console.log("distance", distance)
        //   // console.log("3**************************3")

        //   if (diffDistance < 0.002) {
        //     console.log("**************************")
        //     console.log("**************************")
        //     console.log("diffDistance", diffDistance)
        //     console.log("captureDistance", captureDistance)
        //     console.log("distance", distance)
        //     console.log("**************************")
        //     console.log("**************************")
        //   }
        // }
      }
    }

    canvasCtx.restore()
  }

  useEffect(() => {
    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      },
    })

    faceMesh.setOptions({
      maxNumFaces: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    faceMesh.onResults(onResults)

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await faceMesh.send({ image: webcamRef.current.video })
        },
        width: 640,
        height: 480,
      })
      camera.start()
    }
  })

  function euclideanDistance3D(p1, p2) {
    const dx = p1.x - p2.x
    const dy = p1.y - p2.y
    const dz = p1.z - p2.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  function absDistance(p1, p2) {
    return Math.abs(p1 - p2)
  }

  function calculateScaleDistance(landmark1, landmark2) {
    const dx = landmark1.x - landmark2.x
    const dy = landmark1.y - landmark2.y
    const dz = landmark1.z - landmark2.z
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
    return distance
  }

  const buttonClick = async () => {
    console.log(land)
    landmarkCaptures = land

    canvasRef1.current.width = webcamRef.current.video.videoWidth
    canvasRef1.current.height = webcamRef.current.video.videoHeight

    const canvasElement1 = canvasRef1.current
    const canvasCtx1 = canvasElement1.getContext("2d")

    console.log(results1)
    canvasCtx1.save()
    canvasCtx1.clearRect(0, 0, canvasElement1.width, canvasElement1.height)
    if (results1.multiFaceLandmarks) {
      for (const landmarks of results1.multiFaceLandmarks) {
        connect(canvasCtx1, landmarks, Facemesh.FACEMESH_RIGHT_EYE, {
          color: "#FF3030",
          lineWidth: 1,
        })
        connect(canvasCtx1, landmarks, Facemesh.FACEMESH_RIGHT_EYEBROW, {
          color: "#FF3030",
          lineWidth: 1,
        })
        connect(canvasCtx1, landmarks, Facemesh.FACEMESH_RIGHT_IRIS, {
          color: "#FF3030",
          lineWidth: 1,
        })
        connect(canvasCtx1, landmarks, Facemesh.FACEMESH_LEFT_EYE, {
          color: "#30FF30",
          lineWidth: 1,
        })
        connect(canvasCtx1, landmarks, Facemesh.FACEMESH_LEFT_EYEBROW, {
          color: "#30FF30",
          lineWidth: 1,
        })
        connect(canvasCtx1, landmarks, Facemesh.FACEMESH_LEFT_IRIS, {
          color: "#30FF30",
          lineWidth: 1,
        })
        connect(canvasCtx1, landmarks, Facemesh.FACEMESH_FACE_OVAL, {
          color: "#E0E0E0",
          lineWidth: 1,
        })
        connect(canvasCtx1, landmarks, Facemesh.FACEMESH_LIPS, {
          color: "#E0E0E0",
          lineWidth: 1,
        })
      }

      canvasCtx1.restore()
    }

    console.log("[0]", landmarkCaptures[0])
    console.log("[152]", landmarkCaptures[152])
    console.log("[10]", landmarkCaptures[10])
    console.log("[234]", landmarkCaptures[234])
    console.log("[454]", landmarkCaptures[454])

    if (
      landmarkCaptures !== undefined &&
      landmarkCaptures !== null &&
      landmarkCaptures.length !== 0
    ) {
      captuer0to152Distance = calculateScaleDistance(
        landmarkCaptures[10],
        landmarkCaptures[152]
      )
      console.log("captuer0to152Distance", captuer0to152Distance)

      // const a = calculateScaleDistance(
      //   landmarkCaptures[10],
      //   landmarkCaptures[8]
      // )

      // const b = calculateScaleDistance(
      //   landmarkCaptures[8],
      //   landmarkCaptures[152]
      // )

      // const ab = a / b
      // console.log("original", ab)

      // let distance = 0
      // // for (let i = 0; i < landmarkCaptures.length - 1; i++) {
      // //   distance += euclideanDistance3D(
      // //     landmarkCaptures[0],
      // //     landmarkCaptures[i + 1]
      // //   )
      // // }

      // distance += euclideanDistance3D(
      //   landmarkCaptures[234],
      //   landmarkCaptures[454]
      // )
      // distance += euclideanDistance3D(
      //   landmarkCaptures[234],
      //   landmarkCaptures[152]
      // )
      // distance += euclideanDistance3D(
      //   landmarkCaptures[234],
      //   landmarkCaptures[10]
      // )
      // distance += euclideanDistance3D(
      //   landmarkCaptures[454],
      //   landmarkCaptures[152]
      // )
      // distance += euclideanDistance3D(
      //   landmarkCaptures[454],
      //   landmarkCaptures[10]
      // )

      // captureDistance = distance
      // console.log("distance", distance)
    }
  }

  const buttonClick1 = async () => {
    console.log(land)
    const distance_0 = land

    console.log("**************************")
    console.log("1. 보정 전 값")
    console.log("[0]", distance_0[0])
    console.log("[152]", distance_0[152])
    console.log("[10]", distance_0[10])
    console.log("[234]", distance_0[234])
    console.log("[454]", distance_0[454])
    console.log("**************************")

    /**
     * 1. 스케일 작업
     */
    const _0to152Distance = calculateScaleDistance(
      distance_0[10],
      distance_0[152]
    )

    const scale = _0to152Distance / captuer0to152Distance
    for (let i = 0; i < distance_0.length; i++) {
      distance_0[i].x = distance_0[i].x / scale
      distance_0[i].y = distance_0[i].y / scale
      distance_0[i].z = distance_0[i].z / scale
    }
    // distance_0[10].x = distance_0[10].x / scale
    // distance_0[10].y = distance_0[0].y / scale
    // distance_0[10].z = distance_0[10].z / scale
    // distance_0[152].x = distance_0[152].x / scale
    // distance_0[152].y = distance_0[152].y / scale
    // distance_0[152].z = distance_0[152].z / scale

    console.log("**************************")
    console.log("2. 스케일 작업")
    console.log("[0]", distance_0[0])
    console.log("[152]", distance_0[152])
    console.log("[10]", distance_0[10])
    console.log("[234]", distance_0[234])
    console.log("[454]", distance_0[454])
    console.log("**************************")

    /**
     * 2. 10번째 인덱스 거리 조정
     */
    const diffX_0 = landmarkCaptures[10].x - distance_0[10].x
    const diffY_0 = landmarkCaptures[10].y - distance_0[10].y
    const diffZ_0 = landmarkCaptures[10].z - distance_0[10].z
    for (let i = 0; i < land.length - 1; i++) {
      distance_0[i].x = distance_0[i].x + diffX_0
      distance_0[i].y = distance_0[i].y + diffY_0
      distance_0[i].z = distance_0[i].z + diffZ_0
    }

    // distance_0[10].x = distance_0[10].x + diffX_0
    // distance_0[10].y = distance_0[10].y + diffY_0
    // distance_0[10].z = distance_0[10].z + diffZ_0
    // distance_0[152].x = distance_0[152].x + diffX_0
    // distance_0[152].y = distance_0[152].y + diffY_0
    // distance_0[152].z = distance_0[152].z + diffZ_0

    console.log("**************************")
    console.log("3. 10번째 인덱스 거리 조정")
    console.log("[0]", distance_0[0])
    console.log("[152]", distance_0[152])
    console.log("[10]", distance_0[10])
    console.log("[234]", distance_0[234])
    console.log("[454]", distance_0[454])
    console.log("**************************")

    /**
     * 3. 거리 합산
     */
    if (distance_0 !== undefined && captureDistance !== 0) {
      let distance = 0
      // for (let i = 0; i < distance_0.length - 1; i++) {
      //   distance += euclideanDistance3D(distance_0[0], distance_0[i + 1])
      // }
      distance += euclideanDistance3D(distance_0[234], distance_0[454])
      distance += euclideanDistance3D(distance_0[234], distance_0[152])
      distance += euclideanDistance3D(distance_0[234], distance_0[10])
      distance += euclideanDistance3D(distance_0[454], distance_0[152])
      distance += euclideanDistance3D(distance_0[454], distance_0[10])
      const diffDistance = absDistance(captureDistance, distance)
      console.log("**************************")
      console.log("4. 거리 합산 결과 값")
      console.log("diffDistance", diffDistance)
      console.log("captureDistance", captureDistance)
      console.log("distance", distance)
      console.log("**************************")

      // if (diffDistance < 0.002) {
      //   console.log("**************************")
      //   console.log("**************************")
      //   console.log("diffDistance", diffDistance)
      //   console.log("captureDistance", captureDistance)
      //   console.log("distance", distance)
      //   console.log("**************************")
      //   console.log("**************************")
      // }
    }
  }

  const buttonClick2 = async () => {
    aver = 0
    averCount = 0
    averSum = 0
    minimum = 100000
  }

  return (
    <div className="container-fluid">
      <div className="text-center">
        <button
          type="button"
          className="btn btn-outline-primary me-2"
          onClick={buttonClick}
        >
          버튼1
        </button>
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={buttonClick1}
        >
          버튼2
        </button>
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={buttonClick2}
        >
          버튼3
        </button>
      </div>
      <Webcam
        ref={webcamRef}
        style={{
          position: "absolute",
          marginRight: "auto",
          marginLeft: "auto",
          marginTop: "auto",
          marginBottom: "auto",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 9,
          width: "auto",
          height: "auto",
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          marginRight: "auto",
          marginLeft: "auto",
          marginTop: "auto",
          marginBottom: "auto",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 9,
          width: "auto",
          height: "auto",
        }}
      ></canvas>
      <canvas
        ref={canvasRef1}
        style={{
          position: "absolute",
          marginRight: "auto",
          marginLeft: "auto",
          marginTop: "auto",
          marginBottom: "auto",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 9,
          width: "auto",
          height: "auto",
        }}
      ></canvas>
    </div>
  )
}

export default App
