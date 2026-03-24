#!/bin/bash
set -e

DOCKER_IMAGE=$1
ENV=$2   # stg | prod

APP_DIR="/app"
NGINX_UPSTREAM="/etc/nginx/upstream.conf"

if [ -z "$DOCKER_IMAGE" ] || [ -z "$ENV" ]; then
    echo "Usage: deploy.sh <docker-image> <env>"
    exit 1
fi

echo "=== 배포 시작: $DOCKER_IMAGE ($ENV) ==="

# ── 현재 활성 컨테이너 판별 ──────────────────────────────────────
if docker ps --format "{{.Names}}" | grep -q "^blog-blue$"; then
    CURRENT="blue"
    NEXT="green"
    NEXT_PORT=3001
elif docker ps --format "{{.Names}}" | grep -q "^blog-green$"; then
    CURRENT="green"
    NEXT="blue"
    NEXT_PORT=3000
else
    # 최초 배포
    CURRENT=""
    NEXT="blue"
    NEXT_PORT=3000
fi

echo "현재 활성: ${CURRENT:-없음(최초 배포)} → 새 배포 대상: $NEXT (포트 $NEXT_PORT)"

# ── 새 이미지 Pull ───────────────────────────────────────────────
echo "[1/5] 이미지 Pull 중..."
docker pull "$DOCKER_IMAGE"

# ── 대기 컨테이너 정리 ──────────────────────────────────────────
echo "[2/5] 기존 $NEXT 컨테이너 정리..."
docker stop  "blog-$NEXT" 2>/dev/null || true
docker rm    "blog-$NEXT" 2>/dev/null || true

# ── 새 컨테이너 실행 ────────────────────────────────────────────
echo "[3/5] blog-$NEXT 컨테이너 시작..."
docker run -d \
    --name "blog-$NEXT" \
    -p "$NEXT_PORT:3000" \
    --env-file "$APP_DIR/.env.$ENV" \
    --restart unless-stopped \
    "$DOCKER_IMAGE"

# ── Health Check ────────────────────────────────────────────────
echo "[4/5] Health Check 중..."
MAX_RETRY=10
for i in $(seq 1 $MAX_RETRY); do
    if curl -sf "http://localhost:$NEXT_PORT/ping" > /dev/null 2>&1; then
        echo "Health Check 성공"
        break
    fi
    if [ "$i" -eq "$MAX_RETRY" ]; then
        echo "Health Check 실패 → 롤백"
        docker stop "blog-$NEXT" || true
        docker rm   "blog-$NEXT" || true
        exit 1
    fi
    echo "  재시도 ($i/$MAX_RETRY)..."
    sleep 3
done

# ── Nginx 업스트림 전환 ─────────────────────────────────────────
echo "[5/5] Nginx 업스트림 전환 → 포트 $NEXT_PORT"
echo "server 127.0.0.1:$NEXT_PORT;" | sudo tee "$NGINX_UPSTREAM" > /dev/null
sudo nginx -t && sudo nginx -s reload

echo "트래픽 전환 완료: $NEXT (포트 $NEXT_PORT)"

# ── 이전 컨테이너 종료 ──────────────────────────────────────────
if [ -n "$CURRENT" ]; then
    sleep 5
    echo "이전 컨테이너($CURRENT) 종료..."
    docker stop "blog-$CURRENT" || true
    docker rm   "blog-$CURRENT" || true
fi

# ── 미사용 이미지 정리 ──────────────────────────────────────────
docker image prune -f > /dev/null 2>&1 || true

echo "=== 배포 완료 ==="
