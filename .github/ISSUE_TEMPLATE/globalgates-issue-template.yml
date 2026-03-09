---
name: globalgates issue template
about: Describe this issue template's purpose here.
title: ''
labels: ''
assignees: kausha-kr

---

name: ⚙️ Service 개발/수정
description: Spring Backend Service 단위의 개발 또는 수정 작업을 요청합니다.
title: "[Service] "
labels: ["backend", "service"]
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        ## 🛠️ Service 작업 요청서
        > 새로운 Service 로직을 추가하거나 기존 로직을 수정할 때 작성합니다.
        
        ---

  - type: dropdown
    id: module
    attributes:
      label: 📁 대상 모듈
      description: 작업 대상 모듈을 선택해주세요.
      options:
        - main (메인)
        - login (로그인)
        - join (회원가입)
        - QnA (질문)
        - video chat (화상채팅)
        - news (뉴스)
        - bookmark (북마크)
        - mypage (사업자)
        - mypage (전문가)
        - admin (관리자)
        - friends (친구)
        - "404 (오류)"
        - ad (광고)
        - chat (채팅)
        - search (검색)
        - notification (알림)
        - subscribe (구독)
        - common (공통 모듈)
    validations:
      required: true

  - type: dropdown
    id: work-type
    attributes:
      label: 🔧 작업 유형
      description: 작업 유형을 선택해주세요.
      options:
        - 🆕 신규 개발
        - ✏️ 기존 수정
        - 🔄 리팩토링
        - 🐛 버그 수정
    validations:
      required: true

  - type: input
    id: service-name
    attributes:
      label: 📌 Service 클래스/메서드명
      description: 작업 대상 Service 클래스명 또는 메서드명을 입력해주세요.
      placeholder: "예: MemberService.join() 또는 ExperienceService"
    validations:
      required: true

  - type: textarea
    id: description
    attributes:
      label: 📝 작업 개요
      description: Service가 수행해야 할 비즈니스 로직의 목적과 내용을 상세히 기술해주세요.
      placeholder: |
        ### 목적
        - ex) 회원 가입 시 중복 아이디 체크 로직 구현
        
        ### 상세 내용
        - 
        - 
        - 
    validations:
      required: true
