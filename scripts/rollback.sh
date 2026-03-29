#!/bin/bash
set -e

NGINX_UPSTREAM="/etc/nginx/upstream.conf"

echo "=== 롤백 시작 ==="

# ── 현재 활성 컨테이너 판별 ──────────────────────────────────────
if docker ps --format "{{.Names}}" | grep -q "^blog-blue$"; then
    CURRENT="blue"
    ROLLBACK="green"
    ROLLBACK_PORT=3001
elif docker ps --format "{{.Names}}" | grep -q "^blog-green$"; then
    CURRENT="green"
    ROLLBACK="blue"
    ROLLBACK_PORT=3000
else
    echo "활성 컨테이너를 찾을 수 없습니다."
    exit 1
fi

echo "현재 활성: blog-$CURRENT → 롤백 대상: blog-$ROLLBACK (포트 $ROLLBACK_PORT)"

# ── 롤백 컨테이너 존재 여부 확인 ─────────────────────────────────
if ! docker ps -a --format "{{.Names}}" | grep -q "^blog-$ROLLBACK$"; then
    echo "롤백 대상 컨테이너(blog-$ROLLBACK)가 없습니다. 이전 배포가 보존되지 않았습니다."
    exit 1
fi

# ── 롤백 컨테이너 재시작 ─────────────────────────────────────────
echo "[1/3] blog-$ROLLBACK 컨테이너 재시작..."
docker start "blog-$ROLLBACK"

# ── Health Check ─────────────────────────────────────────────────
echo "[2/3] Health Check 중..."
MAX_RETRY=10
for i in $(seq 1 $MAX_RETRY); do
    if curl -sf "http://localhost:$ROLLBACK_PORT/ping" > /dev/null 2>&1; then
        echo "Health Check 성공"
        break
    fi
    if [ "$i" -eq "$MAX_RETRY" ]; then
        echo "Health Check 실패 → 롤백 중단"
        docker stop "blog-$ROLLBACK" || true
        exit 1
    fi
    echo "  재시도 ($i/$MAX_RETRY)..."
    sleep 3
done

# ── Nginx 업스트림 전환 ──────────────────────────────────────────
echo "[3/3] Nginx 업스트림 전환 → 포트 $ROLLBACK_PORT"
echo "server 127.0.0.1:$ROLLBACK_PORT;" | sudo tee "$NGINX_UPSTREAM" > /dev/null
sudo nginx -t && sudo nginx -s reload

echo "트래픽 전환 완료: blog-$ROLLBACK (포트 $ROLLBACK_PORT)"

# ── 기존 활성 컨테이너 정지 (롤백용 보존) ────────────────────────
sleep 5
echo "이전 컨테이너(blog-$CURRENT) 정지 (롤백용 보존)..."
docker stop "blog-$CURRENT" || true

echo "=== 롤백 완료 ==="
