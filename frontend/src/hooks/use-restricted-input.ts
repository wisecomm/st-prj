'use client';

import { useState, useCallback, ChangeEvent } from 'react';

/**
 * 입력 제한 타입
 */
export type InputRestrictionType =
  | 'korean'       // 한글만
  | 'english'      // 영문만
  | 'number'       // 숫자만
  | 'currency'     // 통화 (숫자 + 자동 콤마 포맷팅)
  | 'alphanumeric' // 영문 + 숫자
  | 'phone'        // 전화번호 (숫자 + 하이픈)
  | 'phoneIntl'    // 국제 전화번호 (숫자 + 하이픈 + 플러스)
  | 'username';    // 사용자명 (영문 + 숫자 + 언더스코어)

/**
 * 입력 제한 패턴 정규식
 */
const patterns: Record<InputRestrictionType, RegExp> = {
  korean: /[^ㄱ-ㅎㅏ-ㅣ가-힣\s]/g,
  english: /[^a-zA-Z\s]/g,
  number: /[^0-9]/g,
  currency: /[^0-9]/g,
  alphanumeric: /[^a-zA-Z0-9]/g,
  phone: /[^0-9-]/g,
  phoneIntl: /[^0-9+-]/g,
  username: /[^a-zA-Z0-9_]/g,
};

/**
 * 숫자를 천 단위 콤마 포맷으로 변환
 */
function formatCurrency(value: string): string {
  const num = value.replace(/[^0-9]/g, '');
  if (!num) return '';
  return Number(num).toLocaleString('ko-KR');
}

/**
 * 콤마 포맷된 문자열에서 숫자만 추출
 */
function parseCurrency(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

/**
 * 입력 제한 설명 (placeholder 등에 활용)
 */
export const inputRestrictionLabels: Record<InputRestrictionType, string> = {
  korean: '한글만 입력 가능',
  english: '영문만 입력 가능',
  number: '숫자만 입력 가능',
  currency: '숫자만 입력 가능 (자동 콤마)',
  alphanumeric: '영문, 숫자만 입력 가능',
  phone: '전화번호 형식 (숫자, 하이픈)',
  phoneIntl: '국제 전화번호 형식',
  username: '영문, 숫자, 언더스코어만 가능',
};

/**
 * 모바일 키보드 최적화를 위한 inputMode 매핑
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode
 */
export const inputModes: Record<InputRestrictionType, React.HTMLAttributes<HTMLInputElement>['inputMode']> = {
  korean: 'text',        // 기본 텍스트 키보드
  english: 'text',       // 기본 텍스트 키보드
  number: 'numeric',     // 숫자 키패드
  currency: 'numeric',   // 숫자 키패드
  alphanumeric: 'text',  // 기본 텍스트 키보드
  phone: 'tel',          // 전화번호 키패드
  phoneIntl: 'tel',      // 전화번호 키패드
  username: 'text',      // 기본 텍스트 키보드
};

export interface UseRestrictedInputOptions {
  /** 초기값 */
  initialValue?: string;
  /** 최대 길이 */
  maxLength?: number;
  /** 값 변경 시 콜백 */
  onValueChange?: (value: string) => void;
}

export interface UseRestrictedInputReturn {
  /** 실제 값 (서버 전송용, currency의 경우 숫자만) */
  value: string;
  /** 표시용 값 (currency의 경우 콤마 포함) */
  displayValue: string;
  /** onChange 핸들러 */
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  /** 값 직접 설정 */
  setValue: (value: string) => void;
  /** 값 초기화 */
  reset: () => void;
  /** input props로 spread 가능 */
  inputProps: {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    maxLength?: number;
    inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  };
}

/**
 * 입력 제한 커스텀 훅
 * 
 * @param type - 입력 제한 타입
 * @param options - 추가 옵션
 * @returns 입력 상태 및 핸들러
 * 
 * @example
 * ```tsx
 * // 기본 사용
 * const name = useRestrictedInput('korean');
 * <input {...name.inputProps} placeholder="이름" />
 * 
 * // 옵션과 함께 사용
 * const phone = useRestrictedInput('phone', { 
 *   maxLength: 13,
 *   onValueChange: (v) => console.log(v)
 * });
 * <input {...phone.inputProps} />
 * ```
 */
export function useRestrictedInput(
  type: InputRestrictionType,
  options: UseRestrictedInputOptions = {}
): UseRestrictedInputReturn {
  const { initialValue = '', maxLength, onValueChange } = options;
  const [displayValue, setDisplayValue] = useState(initialValue);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      let filtered = e.target.value.replace(patterns[type], '');
      
      if (maxLength && filtered.length > maxLength) {
        filtered = filtered.slice(0, maxLength);
      }
      
      // currency 타입은 콤마 포맷팅 적용하여 저장 (displayValue용)
      const displayVal = type === 'currency' ? formatCurrency(filtered) : filtered;
      
      setDisplayValue(displayVal);
      onValueChange?.(filtered); // 콜백에는 실제 값 전달
    },
    [type, maxLength, onValueChange]
  );

  const reset = useCallback(() => {
    setDisplayValue(initialValue);
  }, [initialValue]);

  // 실제 값 (currency의 경우 숫자만)
  const value = type === 'currency' ? parseCurrency(displayValue) : displayValue;

  return {
    value,
    displayValue,
    onChange: handleChange,
    setValue: setDisplayValue,
    reset,
    inputProps: {
      value: displayValue,
      onChange: handleChange,
      inputMode: inputModes[type],
      ...(maxLength && { maxLength }),
    },
  };
}

/**
 * 문자열에서 특정 타입의 문자만 필터링
 * 
 * @example
 * filterByType('abc123!@#', 'alphanumeric') // 'abc123'
 */
export function filterByType(input: string, type: InputRestrictionType): string {
  return input.replace(patterns[type], '');
}
