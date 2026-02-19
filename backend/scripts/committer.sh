#!/bin/bash
set -euo pipefail

# ============================================================
# committer - 스코프 제한 커밋 스크립트 (Backend: Spring Boot)
#
# 사용법:
#   ./backend/scripts/committer.sh "feat: add user api" src/main/java/Foo.java
#
# 기능:
#   1. conventional commit 메시지 형식 검증
#   2. 지정된 파일만 스테이징 (다른 파일 보호)
#   3. 파일 존재 여부 확인
#   4. validate 실행 (Build w/o Test -> Test) 후 통과 시에만 커밋
#   5. 실패 시 스테이징 해제
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

# --- 인자 확인 ---
if [ $# -lt 2 ]; then
  echo -e "${RED}Error: 커밋 메시지와 파일을 지정하세요${NC}"
  echo ""
  echo "사용법: ./backend/scripts/committer.sh \"feat: 설명\" file1 file2 ..."
  echo ""
  echo "커밋 타입:"
  echo "  feat:     새 기능"
  echo "  fix:      버그 수정"
  echo "  refactor: 리팩토링"
  echo "  style:    포맷/스타일"
  echo "  docs:     문서"
  echo "  test:     테스트"
  echo "  chore:    기타"
  exit 1
fi

COMMIT_MSG="$1"
shift
FILES=("$@")

# --- conventional commit 형식 검증 ---
VALID_PREFIXES="^(feat|fix|refactor|style|docs|test|chore|build|ci|perf|revert)(\(.+\))?: .+"
if ! echo "$COMMIT_MSG" | grep -qE "$VALID_PREFIXES"; then
  echo -e "${RED}Error: conventional commit 형식이 아닙니다${NC}"
  echo "  현재: \"$COMMIT_MSG\""
  echo "  예시: \"feat: add user api\""
  exit 1
fi

# --- 파일 존재 확인 ---
MISSING=()
for f in "${FILES[@]}"; do
  if [ ! -e "$f" ]; then
    MISSING+=("$f")
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  echo -e "${RED}Error: 존재하지 않는 파일:${NC}"
  for f in "${MISSING[@]}"; do
    echo "  - $f"
  done
  exit 1
fi

# --- 스테이징 ---
echo -e "${YELLOW}스테이징할 파일 (${#FILES[@]}개):${NC}"
for f in "${FILES[@]}"; do
  echo "  + $f"
done
echo ""

git add "${FILES[@]}"

# --- validate 실행 ---
echo -e "${YELLOW}검증 실행 중... (backend: ./gradlew build)${NC}"

# 백엔드 검증을 위해 디렉토리 이동
pushd backend > /dev/null

# 1. 빌드 (테스트 제외, 빠른 검증)
if ! ./gradlew build -x test; then
  echo -e "${RED}빌드 실패 — 스테이징 해제${NC}"
  popd > /dev/null
  git reset HEAD "${FILES[@]}" > /dev/null 2>&1
  exit 1
fi

# 2. 테스트 (전체 실행은 오래 걸릴 수 있으므로, 필요시 조정 가능)
# 현재는 안전을 위해 test 수행 (단, 속도 문제 시 'check'나 'test' 중 선택)
if ! ./gradlew test; then
  echo -e "${RED}테스트 실패 — 스테이징 해제${NC}"
  popd > /dev/null
  git reset HEAD "${FILES[@]}" > /dev/null 2>&1
  exit 1
fi

popd > /dev/null

# --- 커밋 ---
echo ""
echo -e "${GREEN}검증 통과 — 커밋 실행${NC}"
git commit -m "$COMMIT_MSG"

echo ""
echo -e "${GREEN}커밋 완료:${NC} $COMMIT_MSG"
echo -e "${GREEN}파일 ${#FILES[@]}개${NC}"
