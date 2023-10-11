import "./App.css"
import { FaceMesh } from "@mediapipe/face_mesh"
import * as Facemesh from "@mediapipe/face_mesh"
import * as cam from "@mediapipe/camera_utils"
import Webcam from "react-webcam"
import React, { useRef, useEffect, useState } from "react"

import axios from "axios"

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
  var originalXAver = 0
  var originalYAver = 0
  var refPoints = []
  var meshArrays = []
  var meshLandArrays = []
  var registerMeshPoints = false

  var test = false

  //스케일 변수
  var captuer0to152Distance = 0

  //최솟 값
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

      let XAver = 0
      let YAver = 0
      if (land !== undefined) {
        const angle = getAngle(land[4], land[145], land[374])
        // console.log(
        //   "leftx:",
        //   angle[0],
        //   " lefty:",
        //   angle[1],
        //   "rightx:",
        //   angle[2],
        //   " righty:",
        //   angle[3]
        // )
        XAver = (angle[0] + angle[2]) / 2 - 1.5
        YAver = (angle[1] + angle[3]) / 2 - 0.9

        if (
          registerMeshPoints &&
          refPoints.length > 0 &&
          meshArrays.length < 73
        ) {
          const x = refPoints[meshArrays.length][0]
          const y = refPoints[meshArrays.length][1]

          //console.log(Math.abs(x - XAver), Math.abs(y - YAver))

          if (Math.abs(x - XAver) < 0.1 && Math.abs(y - YAver) < 0.1) {
            meshArrays.push([XAver, YAver])
            meshLandArrays.push({ count: meshArrays.length, land })

            console.log(
              "🚀 ~ file: App.js:129 ~ onResults ~ meshArrays:",
              meshArrays
            )
          }

          if (meshArrays.length >= 73) {
            registerMeshPoints = false
            console.log(
              "🚀 ~ file: App.js:143 ~ onResults ~ registerMeshPoints:",
              registerMeshPoints
            )
          }
        }
      }

      if (
        !registerMeshPoints &&
        land !== undefined &&
        meshLandArrays.length > 72
      ) {
        let minDistance = Number.POSITIVE_INFINITY
        let nearestPoint = null
        let nearestIndex = -1

        // 유클리드 거리 계산 및 가장 가까운 포인트 및 인덱스 찾기
        for (let i = 0; i < meshArrays.length; i++) {
          const point = meshArrays[i]
          const [x1, y1] = point
          const [x2, y2] = [XAver, YAver]
          const distance = Math.sqrt(
            Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)
          )

          if (distance < minDistance) {
            minDistance = distance
            nearestPoint = point
            nearestIndex = i
          }
        }

        // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
        // console.log("새로운 값이 가장 가까운 포인트:", nearestPoint)
        // console.log("가장 가까운 포인트의 인덱스:", nearestIndex)
        //console.log("기존 카운트:", meshLandArrays[nearestIndex].count)

        const distance_0 = land

        /**
         * 1. 스케일 작업
         */
        const _0to152Distance = calculateScaleDistance(
          distance_0[10],
          distance_0[152]
        )

        const captuer0to152Distance = calculateScaleDistance(
          meshLandArrays[nearestIndex].land[10],
          meshLandArrays[nearestIndex].land[152]
        )

        const scale = _0to152Distance / captuer0to152Distance
        for (let i = 0; i < distance_0.length; i++) {
          distance_0[i].x = distance_0[i].x / scale
          distance_0[i].y = distance_0[i].y / scale
          distance_0[i].z = distance_0[i].z / scale
        }

        /**
         * 2. 0번째 인덱스 거리 조정
         */
        const diffX_0 =
          meshLandArrays[nearestIndex].land[10].x - distance_0[10].x
        const diffY_0 =
          meshLandArrays[nearestIndex].land[10].y - distance_0[10].y
        const diffZ_0 =
          meshLandArrays[nearestIndex].land[10].z - distance_0[10].z
        for (let i = 0; i < land.length - 1; i++) {
          distance_0[i].x = distance_0[i].x + diffX_0
          distance_0[i].y = distance_0[i].y + diffY_0
          distance_0[i].z = distance_0[i].z + diffZ_0
        }

        // 3. 각도에 대해서 각도 Point 편차만큼 조정 필요??

        //두 값에 대한 거리 계산
        let distance = 0
        for (let i = 0; i < distance_0.length - 1; i++) {
          distance += euclideanDistance3D(
            meshLandArrays[nearestIndex].land[i],
            distance_0[i]
          )
        }

        const a = meshArrays[nearestIndex][0] - XAver
        const b = meshArrays[nearestIndex][1] - YAver
        if (Math.abs(a) < 0.15 && Math.abs(b) < 0.15) {
          test = true
          //console.log("x:", a, " y:", b)
          //console.log("distance", distance)
          // if (minimum >= distance) {
          //   minimum = distance

          //   console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
          //   console.log("새로운 값이 가장 가까운 포인트:", nearestPoint)
          //   console.log("가장 가까운 포인트의 인덱스:", nearestIndex)
          //   console.log("기존 카운트:", meshLandArrays[nearestIndex].count)
          //   console.log(
          //     "🚀 ~ file: App.js:184 ~ onResults ~ distance:",
          //     distance
          //   )
          //   //console.log("distance", distance)
          // }
          console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
          console.log("새로운 값이 가장 가까운 포인트:", nearestPoint)
          console.log("가장 가까운 포인트의 인덱스:", nearestIndex)
          console.log("기존 카운트:", meshLandArrays[nearestIndex].count)
          console.log("🚀 ~ file: App.js:184 ~ onResults ~ distance:", distance)
        } else {
          console.log("Math.abs(a):", Math.abs(a), " Math.abs(b):", Math.abs(b))
        }
      }

      if (
        landmarkCaptures !== undefined &&
        landmarkCaptures !== null &&
        landmarkCaptures.length !== 0 &&
        land !== undefined
      ) {
        const distance_0 = land

        let a = 100
        let b = 100
        if (XAver !== undefined && YAver != undefined) {
          //const a = absDistance(originalXAver, XAver)
          a = originalXAver - XAver
          //const b = absDistance(originalYAver, YAver)
          b = originalYAver - YAver
          //console.log("originx:", originalXAver, " originy:", originalYAver)
          //console.log("newx:", XAver, " newy:", YAver)
          //console.log("a:", a, " b:", b)
          // if (!test) {
          //   console.log("a:", a, " b:", b)
          // }
        }

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

        //두 값에 대한 거리 계산
        let distance = 0
        for (let i = 0; i < distance_0.length - 1; i++) {
          distance += euclideanDistance3D(landmarkCaptures[i], distance_0[i])
        }

        if (Math.abs(a) < 0.02 && Math.abs(b) < 0.02) {
          test = true
          //console.log("x:", a, " y:", b)
          //console.log("distance", distance)
          if (minimum >= distance) {
            minimum = distance
            console.log(
              "🚀 ~ file: App.js:184 ~ onResults ~ distance:",
              distance
            )
            console.log("distance", distance)
          }
        }
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

  function vecLength(vec) {
    return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2])
  }

  const getAngle = (noseTip, rightEye, leftEye) => {
    // 두 지점 사이의 거리 차이 백터
    const vec = [
      noseTip.x - rightEye.x,
      noseTip.y - rightEye.y,
      noseTip.z - rightEye.z,
    ]

    const vec1 = [
      noseTip.x - leftEye.x,
      noseTip.y - leftEye.y,
      noseTip.z - leftEye.z,
    ]

    //x 절편
    const xAxis = [1, 0, 0]
    //y 절편
    const yAxis = [0, 1, 0]

    //x 절편이랑 스칼라 곱
    const xdotProduct =
      vec[0] * xAxis[0] + vec[1] * xAxis[1] + vec[2] * xAxis[2]
    //y 절편이랑 스칼라 곱
    const ydotProduct =
      vec[0] * yAxis[0] + vec[1] * yAxis[1] + vec[2] * yAxis[2]

    // 두지점 사이의 길이
    const vecLength = Math.sqrt(
      vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]
    )

    //x 절편이랑 스칼라 곱
    const xdotProduct1 =
      vec1[0] * xAxis[0] + vec1[1] * xAxis[1] + vec1[2] * xAxis[2]
    //y 절편이랑 스칼라 곱
    const ydotProduct1 =
      vec1[0] * yAxis[0] + vec1[1] * yAxis[1] + vec1[2] * yAxis[2]

    // 두지점 사이의 길이
    const vec1Length = Math.sqrt(
      vec1[0] * vec1[0] + vec1[1] * vec1[1] + vec1[2] * vec1[2]
    )

    // x 절편의 길이
    const xAxisLength = Math.sqrt(
      xAxis[0] * xAxis[0] + xAxis[1] * xAxis[1] + xAxis[2] * xAxis[2]
    )
    // y 절편의 길이
    const yAxisLength = Math.sqrt(
      yAxis[0] * yAxis[0] + yAxis[1] * yAxis[1] + yAxis[2] * yAxis[2]
    )

    //x cos 각도
    const xcosAngle = xdotProduct / (vecLength * xAxisLength)
    //y cos 각도
    const ycosAngle = ydotProduct / (vecLength * yAxisLength)

    //x cos 각도
    const xcosAngle1 = xdotProduct1 / (vec1Length * xAxisLength)
    //y cos 각도
    const ycosAngle1 = ydotProduct1 / (vec1Length * yAxisLength)

    const xangle = Math.acos(xcosAngle)
    const yangle = Math.acos(ycosAngle)

    const xangle1 = Math.acos(xcosAngle1)
    const yangle1 = Math.acos(ycosAngle1)

    return [xangle, yangle, xangle1, yangle1]
  }

  const buttonClick = async () => {
    console.log(land)
    landmarkCaptures = land

    canvasRef1.current.width = webcamRef.current.video.videoWidth
    canvasRef1.current.height = webcamRef.current.video.videoHeight

    const canvasElement1 = canvasRef1.current
    const canvasCtx1 = canvasElement1.getContext("2d")

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

    if (
      landmarkCaptures !== undefined &&
      landmarkCaptures !== null &&
      landmarkCaptures.length !== 0
    ) {
      captuer0to152Distance = calculateScaleDistance(
        landmarkCaptures[10],
        landmarkCaptures[152]
      )
    }

    const angle = getAngle(
      landmarkCaptures[4],
      landmarkCaptures[145],
      landmarkCaptures[374]
    )
    //console.log("x:", yaw[0], " y:", yaw[1], "x:", yaw[2], " y:", yaw[3])
    originalXAver = (angle[0] + angle[2]) / 2 - 1.5
    originalYAver = (angle[1] + angle[3]) / 2 - 0.9
    console.log("x:", originalXAver, " y:", originalYAver)
  }

  const buttonClick1 = async () => {
    refPoints = []
    meshArrays = []
    meshLandArrays = []
    const radius = 0.15
    const centerX = 0.05
    const centerY = 0.05

    // 정면도 추가 (예를 들어, 0도로 정면을 추가)
    // const frontAngle = 0 // 정면 각도
    // let xFront = centerX + radius * Math.cos(frontAngle * (Math.PI / 180))
    // let yFront = centerY + radius * Math.sin(frontAngle * (Math.PI / 180))
    refPoints.push([0, 0])

    for (let angle = 0; angle < 360; angle += 5) {
      let x = centerX + radius * Math.cos(angle * (Math.PI / 180))
      let y = centerY + radius * Math.sin(angle * (Math.PI / 180))
      refPoints.push([x, y])
    }

    console.log(refPoints)
    registerMeshPoints = true
  }

  const buttonClick2 = async () => {
    test = false
    minimum = 100000
  }

  const buttonClick3 = async () => {
    const url = "/webservices/GeneralService.asmx"
    const headers = {
      "Content-Type": "text/xml;charset=UTF-8",
      soapAction: "http://tempuri.org/UpdateUserDataJSON2",
    }

    const body = {
      AuthKeyEncD:
        "NTL8j6WmZY6OIW7lhpxa2J2jlEx7W0MOLkYeGVGAGefY+EDA1UDHX4OftZsDihP73lZlGBnHJobM R27BHgwDp8qpoHYQvpjybQ5opMjwj10iVFOISQCuPtDHkfe3d9PU6wF8QGhNHmX3QMIudUAtcvny 0QdfKj1wHl9wja4lVSdNu+cZ1QMRWxnLhPNZOntqeKUdeA6jIDJKYScoQd+MAcv/rbd109AgqGcW es9NBgg+o7aiO5+Yh9H+WhCeyWdXKAmBkn+72yAO6szof09HwMnWajZGok4JwsjgxIfNtMgtyi2O mQ1W5u08aNSYzEyh4SoNomUg6e/UFUnQpeqw7Q==",
      SessionIDEncN: "79e81d0b-ba7d-7ef3-2919-949d8912a19d",
      UserOid: 100000025,
      DeviceIdEncN: "asd",
      InputJSON: JSON.stringify(meshArrays),
      Mode: "UPDATE_ANGLE_POINTS",
    }

    const xml = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <UpdateUserDataJSON2 xmlns="http://tempuri.org/">
          <AuthKeyEncD>${body.AuthKeyEncD}</AuthKeyEncD>
          <SessionIDEncN>${body.SessionIDEncN}</SessionIDEncN>
          <UserOid>${body.UserOid}</UserOid>
          <DeviceIdEncN>${body.DeviceIdEncN}</DeviceIdEncN>
          <InputJSON>${body.InputJSON}</InputJSON>
          <Mode>${body.Mode}</Mode>
        </UpdateUserDataJSON2>
      </soap:Body>
    </soap:Envelope>`

    const fetchData = async () => {
      try {
        const response = await axios.post(url, xml, {
          headers,
        })
        const { data } = response

        console.log(data)
      } catch (error) {
        console.error(error)
      }
    }

    fetchData()
  }

  return (
    <div className="container-fluid">
      <div className="text-center">
        <button
          type="button"
          className="btn btn-outline-primary me-2"
          onClick={buttonClick}
        >
          얼굴표본저장
        </button>
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={buttonClick1}
        >
          각도저장+얼굴표본저장
        </button>
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={buttonClick2}
        >
          리셋
        </button>
        {/* <button
          type="button"
          className="btn btn-outline-primary"
          onClick={buttonClick3}
        >
          버튼4
        </button> */}
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
