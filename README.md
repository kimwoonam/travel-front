# travel-front

## 개요

* Cursor AI를 통한 게시판 FrontEnd/BackEnd 개발

## 개발스킬

### FrontEnd

* @types/react: "^18.3.5"
* @types/react-dom: "^18.3.0"
* @vitejs/plugin-react: "^4.3.1"
* typescript: "^5.5.4"
* vite: "^5.3.4"

### BackEnd

* JDK 17
* Spring Boot 3.3.3
    * web
    * jpa
    * security
* jjwt
* maven 3.11

### DBMS

* PostgreSQL 16
* Docker를 사용하여 생성함


## 구조
```bash
├── contexts
│   └── AuthContext.tsx 인증 프로바이더 설정
├── hooks
├── pages
│   ├── auth
│   │   ├── DeletePage.tsx // 회원탈퇴
│   │   ├── LoginPage.tsx  // 로그인
│   │   └── SignupPage.tsx // 회원가입
│   ├── board
│   │   ├── BoardDetailPage.tsx // 게시글 상세
│   │   ├── BoardEditPage.tsx   // 게시글 수정
│   │   ├── BoardListPage.tsx   // 게시판 목록
│   │   └── BoardWritePage.tsx  // 게시판 등록
│   └── IndexPage.tsx  // 인덱스
├── local.env // 환경변수 설정
└── main.tsx  // root 및 router 설정
``` 
## github

* frontend : https://github.com/kimwoonam/travel-front
* backend : https://github.com/kimwoonam/travel-backend