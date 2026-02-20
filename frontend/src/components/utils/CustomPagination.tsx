import type { Table } from '@tanstack/react-table';

interface CustomPaginationProps<TData> {
    table: Table<TData>;
    pageSizeOptions?: number[];
    serverSide?: boolean;
    totalRows?: number;
    loading?: boolean;
}

/**
 * 커스텀 페이지네이션 컴포넌트 예제
 * AG-Grid 스타일의 페이지 네비게이션 UI
 */
export function CustomPagination<TData>({
    table,
    pageSizeOptions = [10, 20, 50, 100],
    serverSide,
    totalRows: serverTotalRows,
}: CustomPaginationProps<TData>) {
    const {
        getState,
        setPageIndex,
        setPageSize,
        getCanPreviousPage,
        getCanNextPage,
        getPageCount,
        previousPage,
        nextPage,
    } = table;

    const { pageIndex, pageSize } = getState().pagination;
    const pageCount = getPageCount();

    // 총 행 수 계산
    const totalRows = serverSide && serverTotalRows !== undefined
        ? serverTotalRows
        : table.getFilteredRowModel().rows.length;

    const startRow = totalRows > 0 ? pageIndex * pageSize + 1 : 0;
    const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

    // 페이지 번호 입력 핸들러
    const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const target = e.target as HTMLInputElement;
            const page = parseInt(target.value, 10) - 1;
            if (page >= 0 && page < pageCount) {
                setPageIndex(page);
            }
            target.value = String(pageIndex + 1);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            fontSize: '14px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
            {/* 왼쪽: 행 정보 */}
            <div style={{ color: '#64748b' }}>
                <strong style={{ color: '#334155' }}>{startRow}</strong>
                {' ~ '}
                <strong style={{ color: '#334155' }}>{endRow}</strong>
                {' / '}
                <strong style={{ color: '#334155' }}>{totalRows}</strong>
                {' 건'}
            </div>

            {/* 중앙: 페이지 네비게이션 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* 첫 페이지 */}
                <button
                    onClick={() => setPageIndex(0)}
                    disabled={!getCanPreviousPage()}
                    style={{
                        padding: '6px 10px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        backgroundColor: getCanPreviousPage() ? '#fff' : '#f1f5f9',
                        color: getCanPreviousPage() ? '#334155' : '#94a3b8',
                        cursor: getCanPreviousPage() ? 'pointer' : 'not-allowed',
                        fontSize: '12px',
                        fontWeight: 600,
                    }}
                    title="첫 페이지"
                >
                    ⏮
                </button>

                {/* 이전 페이지 */}
                <button
                    onClick={() => previousPage()}
                    disabled={!getCanPreviousPage()}
                    style={{
                        padding: '6px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        backgroundColor: getCanPreviousPage() ? '#fff' : '#f1f5f9',
                        color: getCanPreviousPage() ? '#334155' : '#94a3b8',
                        cursor: getCanPreviousPage() ? 'pointer' : 'not-allowed',
                        fontSize: '12px',
                        fontWeight: 600,
                    }}
                    title="이전 페이지"
                >
                    ◀ 이전
                </button>

                {/* 페이지 입력 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                        type="number"
                        defaultValue={pageIndex + 1}
                        key={pageIndex} // 페이지 변경 시 리렌더
                        onKeyDown={handlePageInput}
                        onBlur={(e) => {
                            const page = parseInt(e.target.value, 10) - 1;
                            if (page >= 0 && page < pageCount) {
                                setPageIndex(page);
                            } else {
                                e.target.value = String(pageIndex + 1);
                            }
                        }}
                        style={{
                            width: '50px',
                            padding: '6px 8px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: 600,
                        }}
                        min={1}
                        max={pageCount}
                    />
                    <span style={{ color: '#64748b' }}>
                        / <strong style={{ color: '#334155' }}>{pageCount || 1}</strong> 페이지
                    </span>
                </div>

                {/* 다음 페이지 */}
                <button
                    onClick={() => nextPage()}
                    disabled={!getCanNextPage()}
                    style={{
                        padding: '6px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        backgroundColor: getCanNextPage() ? '#fff' : '#f1f5f9',
                        color: getCanNextPage() ? '#334155' : '#94a3b8',
                        cursor: getCanNextPage() ? 'pointer' : 'not-allowed',
                        fontSize: '12px',
                        fontWeight: 600,
                    }}
                    title="다음 페이지"
                >
                    다음 ▶
                </button>

                {/* 마지막 페이지 */}
                <button
                    onClick={() => setPageIndex(pageCount - 1)}
                    disabled={!getCanNextPage()}
                    style={{
                        padding: '6px 10px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        backgroundColor: getCanNextPage() ? '#fff' : '#f1f5f9',
                        color: getCanNextPage() ? '#334155' : '#94a3b8',
                        cursor: getCanNextPage() ? 'pointer' : 'not-allowed',
                        fontSize: '12px',
                        fontWeight: 600,
                    }}
                    title="마지막 페이지"
                >
                    ⏭
                </button>
            </div>

            {/* 오른쪽: 페이지 크기 선택 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#64748b' }}>페이지당</span>
                <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    style={{
                        padding: '6px 10px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        backgroundColor: '#fff',
                        fontSize: '14px',
                        cursor: 'pointer',
                    }}
                >
                    {pageSizeOptions.map((size) => (
                        <option key={size} value={size}>
                            {size}건
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
