# 손끝 튜토리얼 — Hand & Body Pose with Create ML

CreateML 스터디 3주차(Hand·Body Pose) 세션의 가이딩 리소스로 만든 정적 웹앱입니다.
비전공자도 읽을 수 있는 튜토리얼 + 인터랙티브 데모 + 핸즈온 안내를 한 페이지에 담았습니다.

## 구조

```
handposeTutorialWebApp/
├── index.html          # 튜토리얼 본문 (단일 페이지)
├── assets/
│   ├── styles.css      # 디자인 시스템 (라이트/다크 자동 + 수동 토글)
│   ├── app.js          # 인터랙션 (퀴즈, 배경 데모, 웹캠 키포인트 데모, 로티 로더)
│   └── lottie/
│       └── keypoint-pulse.json   # 섹션 구분용 로티 (교체 가능)
└── README.md
```

## 로컬에서 열기

웹캠 데모는 `file://`에서 동작하지 않으므로(브라우저 카메라 정책) 간단한 서버로 여세요.

```bash
cd handposeTutorialWebApp
python3 -m http.server 8080
# → http://localhost:8080
```

## 배포 (공유용)

정적 파일뿐이라 아무 정적 호스팅이면 됩니다. 추천: GitHub Pages.

1. 이 폴더를 GitHub 저장소로 푸시
2. Settings → Pages → Branch: `main`, 폴더 `/ (root)` 선택
3. `https://<계정>.github.io/<저장소>/` 로 공유

GitHub Pages는 https라서 웹캠 데모도 그대로 동작합니다.

## 로티 교체·추가하기

`index.html`의 `<div class="lottie-slot" data-lottie="assets/lottie/파일명.json">` 슬롯이
로티 플레이어입니다. [LottieFiles](https://lottiefiles.com)에서 받은 `.json`을
`assets/lottie/`에 넣고 `data-lottie` 경로만 바꾸면 됩니다.
로티 로드에 실패하면 슬롯 안의 정적 SVG가 그대로 남으므로 페이지가 깨지지 않습니다.

## 웹캠 데모에 관해

브라우저에서는 MediaPipe Hand Landmarker(CDN)로 손 21개 관절을 실시간 표시합니다.
애플 플랫폼의 Vision 프레임워크(`VNDetectHumanHandPoseRequest`)와 같은 21개 관절 개념을
브라우저에서 체험시키기 위한 것으로, 본문에도 그렇게 명시되어 있습니다.
카메라 권한을 거부해도 나머지 튜토리얼은 전부 동작합니다.

## 외부 의존성 (전부 CDN, 선택적)

- lottie-web — 로티 재생 (실패 시 정적 SVG 폴백)
- @mediapipe/tasks-vision — 웹캠 키포인트 데모 (버튼 누를 때만 로드)
