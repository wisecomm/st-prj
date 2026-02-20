# Custom Hooks

## 📚 개요

프로젝트에서 사용하는 커스텀 훅들입니다.

## 📁 파일 구조

```
hooks/
├── index.ts                        # Shared/Global hooks export
├── query/                          # Shared React Query factories
│   ├── factory.ts
│   └── README.md
├── use-auth.ts                     # Auth hooks (Global)
├── use-toast.tsx                   # UI Feedback
└── use-excel.ts                    # Excel Utility

> **Note**: Feature-specific hooks (Users, Roles, Boards, etc.) have been moved to their respective feature directories (e.g., `app/(admin)/users/hooks/`). See [Feature Architecture](../docs/FEATURE_ARCHITECTURE.md) for details.
```

## ⚠️ 네이밍 컨벤션

**kebab-case를 사용합니다!**

```typescript
// ✅ 올바른 import
import { useAuth } from '@/hooks/use-auth';
import { useUsers } from '@/hooks/use-user-query';

// ⚠️ 레거시 (하위 호환성 - deprecated)
import { useAuth } from '@/hooks/use-auth';
```

## 🎯 주요 훅

### useUserManagement

사용자 관리 페이지의 모든 비즈니스 로직을 캡슐화합니다.

```typescript
import { useUserManagement } from '@/hooks/use-user-management';

function UsersPage() {
    const {
        users,
        isLoading,
        handleCreate,
        handleUpdate,
        handleDelete,
    } = useUserManagement();
    
    // 간결한 UI 로직만
}
```

### useAuth

인증 상태 및 기능을 제공합니다.

```typescript
import { useAuth } from '@/hooks/use-auth';

function Component() {
    const { 
        isAuthenticated, 
        user, 
        login, 
        logout 
    } = useAuth();
}
```

### React Query 훅

각 도메인별 데이터 페칭 훅입니다.

```typescript
import { useUsers, useCreateUser } from '@/hooks/use-user-query';
import { useRoles } from '@/hooks/use-role-query';
import { useMenus } from '@/hooks/use-menu-query';
```

## 💡 Best Practices

### 1. 중앙 index에서 import

```typescript
// ✅ 권장: index에서 import
import { useAuth, useUsers, useToast } from '@/hooks';

// ⚠️ 개별 파일에서 import도 가능
import { useAuth } from '@/hooks/use-auth';
```

### 2. 비즈니스 로직 분리

```typescript
// ✅ 좋은 예: 비즈니스 로직을 훅으로 분리
function UsersPage() {
    const { users, handleCreate } = useUserManagement();
    return <UserList users={users} onCreate={handleCreate} />;
}

// ❌ 나쁜 예: 페이지에 모든 로직
function UsersPage() {
    const [users, setUsers] = useState([]);
    const handleCreate = async () => { /* 50줄 */ };
    // ...
}
```

### 3. 단일 책임 원칙

각 훅은 하나의 책임만 가져야 합니다.

```typescript
// ✅ 좋은 예
const userManagement = useUserManagement();  // 사용자 CRUD
const auth = useAuth();                      // 인증

// ❌ 나쁜 예
const everything = useEverything();  // 너무 많은 책임
```

## 🔗 관련 문서

- [React Query Factory](./query/README.md)
- [API Client](../lib/api/README.md)
- [Auth System](../lib/auth/README.md)

---

Made with ❤️ by the Development Team
