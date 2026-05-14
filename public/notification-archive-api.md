---
title: 알림 Archive 기능 API 명세
description: inquiry 완료 시 알림이 패널에서 자동으로 사라지는 기능 - 프론트엔드 연동 가이드
date: 2026-05-14
tags: [backend, notification, api, garam]
Archives: false
URL:
---

# 알림 Archive 기능 API 명세

## 핵심 개념

문의(inquiry)가 **완료(completed)** 되면, 해당 문의와 관련된 알림들이 알림 패널에서 **자동으로 사라집니다**.

- 삭제되는 게 아니라 DB에는 남아있고, 기본 조회에서만 제외됩니다.
- 프론트가 읽음 처리를 하든 안 하든 관계없이, **완료 시점에 즉시 숨겨집니다**.

### 어떤 알림이 숨겨지나요?

| 알림 타입 | 완료 시 처리 |
|-----------|-------------|
| `inquiry_new` | 자동 archive (패널에서 사라짐) |
| `inquiry_assigned` | 자동 archive (패널에서 사라짐) |
| `inquiry_completed` | 자동 archive (패널에서 사라짐) |

즉, 완료되는 순간 해당 문의 관련 알림은 **전부** 패널에서 사라집니다.

---

## 변경된 API

### 1. 알림 목록 조회

```
GET /notifications
```

**추가된 파라미터:**

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `recipient_admin_id` | int | 필수 | 수신 관리자 ID |
| `unread_only` | bool | false | 읽지 않은 알림만 조회 |
| `include_archived` | bool | **false** | archive된 알림 포함 여부 |
| `offset` | int | 0 | 페이지네이션 오프셋 |
| `limit` | int | 50 | 최대 조회 수 (max 200) |

> 기본값(`include_archived=false`)으로 호출하면 archive된 알림은 응답에 포함되지 않습니다.
> 기존에 이 API를 쓰고 있다면 **별도 수정 없이 자동으로 적용**됩니다.

**응답 필드 추가:**

```json
{
  "id": 123,
  "event_type": "inquiry_new",
  "inquiry_id": 45,
  "archived_at": null,
  ...
}
```

`archived_at` 필드가 새로 생겼습니다. 완료된 알림은 여기에 시간이 찍혀 있습니다.

---

### 2. 미읽음 배지 숫자

```
GET /notifications/unread-count
```

archive된 알림은 **자동으로 카운트에서 제외**됩니다. 별도 수정 불필요합니다.

---

### 3. 알림 수동 Archive (신규)

프론트에서 특정 알림을 직접 숨기고 싶을 때 사용합니다.

```
PATCH /notifications/{notification_id}/archive
```

**Request Body:**

```json
{
  "recipient_admin_id": 26
}
```

**Response:**

```json
{
  "ok": true,
  "notification_id": 123,
  "unread_count": 4
}
```

> 이미 archive된 알림에 다시 요청해도 오류 없이 `ok: true`가 반환됩니다 (idempotent).
> 존재하지 않거나 다른 사람 알림이면 `404`를 반환합니다.

---

## WebSocket 이벤트

문의가 완료될 때 **실시간으로** 프론트에 이벤트가 전달됩니다.

### `notifications_archived` 이벤트

```json
{
  "type": "notifications_archived",
  "inquiry_id": 45,
  "notification_ids": [123, 124],
  "unread_count": 4
}
```

| 필드 | 설명 |
|------|------|
| `inquiry_id` | 완료된 문의 ID (`null`이면 수동 archive) |
| `notification_ids` | 이번에 숨겨진 알림 ID 목록 |
| `unread_count` | 갱신된 미읽음 수 |

**프론트 처리 예시:**

```javascript
socket.on('message', (data) => {
  if (data.type === 'notifications_archived') {
    // 알림 목록에서 해당 ID들 제거
    removeNotifications(data.notification_ids);
    // 배지 숫자 업데이트
    updateBadge(data.unread_count);
  }
});
```

---

## 전체 흐름 요약

```
문의 완료 (어느 경로든)
    ↓
백엔드: 관련 알림 전부 archived_at 시간 기록
    ↓
백엔드: WS로 "notifications_archived" 이벤트 전송
    ↓
프론트 (WS 수신): notification_ids 알림을 목록/배지에서 즉시 제거
프론트 (API 재조회 시): GET /notifications 기본값이 archived 제외이므로 자연히 미포함
```

---

## 마이그레이션 완료 사항

기존 DB에 이미 완료된 문의들의 알림도 **자동으로 archive 처리**됐습니다.
배포 즉시 기존 완료 문의 알림들도 패널에 나타나지 않습니다.




---

# Resources
