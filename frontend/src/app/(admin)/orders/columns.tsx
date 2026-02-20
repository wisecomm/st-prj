"use client";

import { OrderDetail, OrderStatusLabels } from "./types";
import { SOColumnDef } from "so-grid-core";
import { CommonGrid } from "@/components/utils/common-grid";

export const getColumns = (): SOColumnDef<OrderDetail>[] => [
    {
        field: 'id',
        headerName: '',
        maxWidth: 30,
        checkboxSelection: true,
    },
    {
        field: 'orderId',
        headerName: '주문 번호',
        maxWidth: 120,
        sortable: true,
    },
    {
        field: 'orderStatus',
        headerName: '상태',
        maxWidth: 100,
        cellStyle: { textAlign: 'center' },
        valueFormatter: ({ value }) => OrderStatusLabels[String(value)] || value,
    },
    {
        field: 'custNm',
        headerName: '고객명',
        maxWidth: 120,
    },
    {
        field: 'orderNm',
        headerName: '주문명',
        maxWidth: 200,
    },
    {
        field: 'orderAmt',
        headerName: '금액',
        maxWidth: 120,
        cellStyle: { textAlign: 'right' },
        valueFormatter: ({ value }) => Number(value).toLocaleString(),
    },
    {
        field: 'orderDate',
        headerName: '주문일',
        valueFormatter: CommonGrid.formatDate,
        cellStyle: { textAlign: 'center' },
        maxWidth: 120,
    },
];
