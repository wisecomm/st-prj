# React Query 훅 팩토리

## 📚 개요

표준화된 React Query 훅을 생성하는 팩토리 함수입니다. 중복 코드를 제거하고 일관된 패턴을 제공합니다.

## 🎯 주요 기능

- ✅ **자동 에러 처리** - API 응답 검증 자동화
- ✅ **타입 안전성** - 완전한 TypeScript 지원
- ✅ **쿼리 무효화** - 자동 캐시 관리
- ✅ **코드 감소** - 75% 코드 감소
- ✅ **일관성** - 모든 훅이 동일한 패턴 사용

## 🚀 빠른 시작

### 1. 쿼리 훅 생성

```typescript
import { createQuery } from './query/factory';
import { menuApi } from '@/lib/api';

export const useMenus = createQuery<MenuInfo[], void>({
    queryKey: () => ['menus', 'list'],
    queryFn: () => menuApi.getList(),
});

// 사용
function Component() {
    const { data, isLoading } = useMenus();
}
```

### 2. 페이지네이션 쿼리

```typescript
import { createPaginatedQuery } from './query/factory';

export const useUsers = createPaginatedQuery<
    PageResponse<UserDetail>,
    { page: number; size: number }
>({
    queryKey: (params) => ['users', params],
    queryFn: (params) => userApi.search(params),
});

// 사용
const { data } = useUsers({ page: 0, size: 10 });
```

### 3. 뮤테이션 훅 생성

```typescript
import { createMutation } from './query/factory';

export const useCreateUser = createMutation<void, Partial<UserDetail>>({
    mutationFn: (data) => userApi.create(data),
    invalidateKeys: [['users']], // 자동 캐시 무효화
});

// 사용
const createUser = useCreateUser();
await createUser.mutateAsync({ userName: 'John' });
```

## 📖 API 참조

### createQuery

기본 쿼리 훅을 생성합니다.

```typescript
function createQuery<TData, TParams>(
    config: {
        queryKey: (params: TParams) => QueryKey;
        queryFn: (params: TParams) => Promise<ApiResponse<TData>>;
        enabled?: (params: TParams) => boolean;
    },
    options?: UseQueryOptions<TData>
): (params: TParams) => UseQueryResult<TData>
```

**예제:**
```typescript
const useMenu = createQuery<MenuInfo, { id: string }>({
    queryKey: (params) => ['menus', params.id],
    queryFn: (params) => menuApi.getById(params.id),
    enabled: (params) => !!params.id,
});
```

### createPaginatedQuery

페이지네이션을 지원하는 쿼리 훅을 생성합니다.

```typescript
function createPaginatedQuery<TData, TParams>(
    config: {
        queryKey: (params: TParams) => QueryKey;
        queryFn: (params: TParams) => Promise<ApiResponse<TData>>;
        enabled?: (params: TParams) => boolean;
        placeholderData?: boolean; // 기본값: true
    },
    options?: UseQueryOptions<TData>
): (params: TParams) => UseQueryResult<TData>
```

**특징:**
- 자동으로 `placeholderData` 설정 (이전 데이터 유지)
- 페이지 전환 시 부드러운 UX

### createMutation

뮤테이션 훅을 생성합니다.

```typescript
function createMutation<TData, TVariables>(
    config: {
        mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>;
        invalidateKeys?: QueryKey[];
        onSuccessMessage?: string;
    },
    options?: UseMutationOptions<TData, Error, TVariables>
): () => UseMutationResult<TData, Error, TVariables>
```

**특징:**
- 자동 에러 처리
- 자동 쿼리 무효화
- 성공 메시지 지원 (선택적)

### createCrudMutations

CRUD 뮤테이션 세트를 한 번에 생성합니다.

```typescript
function createCrudMutations<TEntity>(
    config: {
        queryKeys: {
            all: QueryKey;
            detail?: (id: string) => QueryKey;
        };
        mutations: {
            create: (data: Partial<TEntity>) => Promise<ApiResponse<void>>;
            update: (id: string, data: Partial<TEntity>) => Promise<ApiResponse<void>>;
            delete: (id: string) => Promise<ApiResponse<void>>;
        };
    }
): {
    useCreate: () => UseMutationResult;
    useUpdate: () => UseMutationResult;
    useDelete: () => UseMutationResult;
}
```

## 🎓 사용 패턴

### 조건부 쿼리

```typescript
const useUserRoles = createPaginatedQuery<string[], { userId: string }>({
    queryKey: (params) => ['users', params.userId, 'roles'],
    queryFn: (params) => userApi.getRoles(params.userId),
    enabled: (params) => !!params.userId, // userId가 있을 때만 실행
});

// 사용
const { data } = useUserRoles({ userId: selectedUserId || '' });
// userId가 없으면 쿼리 실행 안 됨
```

### 커스텀 옵션 추가

```typescript
const { data } = useUsers(
    { page: 0, size: 10 },
    {
        // 추가 React Query 옵션
        staleTime: 5 * 60 * 1000, // 5분
        refetchOnWindowFocus: false,
        retry: 3,
    }
);
```

### 여러 쿼리 무효화

```typescript
const useAssignUserRoles = createMutation<void, { userId: string; roleIds: string[] }>({
    mutationFn: ({ userId, roleIds }) => userApi.assignRoles(userId, roleIds),
    invalidateKeys: [
        userKeys.all,           // 모든 사용자 쿼리
        roleKeys.all,           // 모든 역할 쿼리
    ],
});
```

## 💡 Best Practices

### 1. Query Keys 구조화

```typescript
// ✅ 계층적 구조
export const userKeys = {
    all: ['users'] as const,
    lists: () => [...userKeys.all, 'list'] as const,
    list: (filters) => [...userKeys.lists(), filters] as const,
    details: () => [...userKeys.all, 'detail'] as const,
    detail: (id) => [...userKeys.details(), id] as const,
};

// 무효화 시
queryClient.invalidateQueries({ queryKey: userKeys.all }); // 모든 users 쿼리
queryClient.invalidateQueries({ queryKey: userKeys.lists() }); // list만
```

### 2. 파라미터 객체화

```typescript
// ✅ 좋은 예: 객체로 전달
type UserSearchParams = {
    page: number;
    size: number;
    userName?: string;
    startDate?: string;
    endDate?: string;
};

const useUsers = createPaginatedQuery<PageResponse<UserDetail>, UserSearchParams>({
    queryKey: (params) => ['users', params],
    queryFn: (params) => userApi.search(params),
});

// ❌ 나쁜 예: 개별 파라미터
const useUsers = (page, size, userName?, startDate?, endDate?) => { ... }
```

### 3. 타입 명시

```typescript
// ✅ 명시적 타입
const useUsers = createPaginatedQuery<
    PageResponse<UserDetail>,  // 리턴 타입
    UserSearchParams           // 파라미터 타입
>({ ... });

// ❌ 타입 추론만 사용
const useUsers = createPaginatedQuery({ ... });
```

## 🔄 마이그레이션

### Before (기존 코드)

```typescript
export function useUsers(page: number, size: number) {
    return useQuery({
        queryKey: ['users', page, size],
        queryFn: async () => {
            const res = await getUsers(page, size);
            if (res.code !== "200") throw new Error(res.message);
            return res.data;
        },
        placeholderData: (prev) => prev,
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            const res = await createUser(data);
            if (res.code !== "200") throw new Error(res.message);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}
```

### After (팩토리 사용)

```typescript
export const useUsers = createPaginatedQuery<
    PageResponse<UserDetail>,
    { page: number; size: number }
>({
    queryKey: (params) => ['users', params],
    queryFn: (params) => userApi.search(params),
});

export const useCreateUser = createMutation<void, Partial<UserDetail>>({
    mutationFn: (data) => userApi.create(data),
    invalidateKeys: [['users']],
});
```

**개선 효과:**
- 코드 75% 감소
- 일관된 에러 처리
- 자동 타입 추론

## 📊 성능

- **번들 크기**: 변화 없음 (트리 쉐이킹)
- **런타임**: 오버헤드 없음
- **타입 체크**: 컴파일 타임에만 작동

## 🔗 관련 문서

- [React Query 공식 문서](https://tanstack.com/query/latest)
- [API 클라이언트](../lib/api/README.md)
- [마이그레이션 가이드](../../docs/react-query-migration.md)

---

Made with ❤️ by the Development Team
