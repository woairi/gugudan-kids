# gugudan-kids

초2(모바일)용 구구단(0~9단) 학습·연습 사이트.

배포: https://gugudan-kids.vercel.app/

## 기능
- 학습(`/learn`)
  - 0~9단 표 보기
  - 랜덤 한 줄 복습(뽑기)
  - Learn→Quiz 브릿지(확인 팝업)
- 퀴즈(`/quiz`)
  - 단 선택 후 시작
  - 즉시 채점(객관식)
  - 약한 문제 모드(오답/저시도 기반)
  - 이어서 하기(진행 중 세션 저장/복구)
- 결과(`/result`)
  - 다시 풀어볼 문제(세션 오답)
  - 최근 기록(표정)
- 스티커(`/collection`)
  - 첫 퀴즈/만점/단별 마스터 배지
- 보호자 설정(`/parents`)
  - 사운드 ON/OFF
  - 문제 수 10/20
  - 난이도(곱하는 수 0~9 / 0~12)
  - 모두 지우기(로컬 데이터 초기화)

## 개발

```bash
npm install
npm run dev
```

검사/빌드:
```bash
npm run lint
npm run build
```

## 배포 (GitHub → Vercel)
- `main` 브랜치 push → Vercel Production 자동 배포
- PR → Vercel Preview 자동 생성

## 로컬 저장(localStorage) 키
- `gugudan.settings.v1` : 사운드/문제수/난이도
- `gugudan.lastResult.v1` : 마지막 퀴즈 결과
- `gugudan.recentResults.v1` : 최근 결과 목록
- `gugudan.itemStats.v1` : 문제별 시도/오답 통계(약한 문제 모드)
- `gugudan.rewards.v1` : 스티커(배지) 언락 상태
- `gugudan.activeSession.v1` : 진행 중 퀴즈 세션(이어서 하기)
- `gugudan.daily.v1` : 날짜별 오늘 기록(solved/correct)

## 문서
- 개발 로그: `docs/devlog.md`
- 초기 기획: `../docs/gugudan-mvp-plan.md` (상위 폴더)
