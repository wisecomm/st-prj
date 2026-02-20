import { describe, it, expect, vi } from "vitest";
import { filterByType, inputRestrictionLabels, inputModes } from "./use-restricted-input";

describe("filterByType", () => {
  it("korean: 한글과 공백만 남긴다", () => {
    expect(filterByType("abc가나다123", "korean")).toBe("가나다");
  });

  it("english: 영문과 공백만 남긴다", () => {
    expect(filterByType("abc가나다123", "english")).toBe("abc");
  });

  it("number: 숫자만 남긴다", () => {
    expect(filterByType("abc123def456", "number")).toBe("123456");
  });

  it("currency: 숫자만 남긴다", () => {
    expect(filterByType("1,234,567원", "currency")).toBe("1234567");
  });

  it("alphanumeric: 영문과 숫자만 남긴다", () => {
    expect(filterByType("abc123!@#가나다", "alphanumeric")).toBe("abc123");
  });

  it("phone: 숫자와 하이픈만 남긴다", () => {
    expect(filterByType("010-1234-5678abc", "phone")).toBe("010-1234-5678");
  });

  it("phoneIntl: 숫자, 하이픈, 플러스만 남긴다", () => {
    expect(filterByType("+82-10-1234-5678abc", "phoneIntl")).toBe("+82-10-1234-5678");
  });

  it("username: 영문, 숫자, 언더스코어만 남긴다", () => {
    expect(filterByType("user_name123!@#", "username")).toBe("user_name123");
  });

  it("빈 문자열을 처리한다", () => {
    expect(filterByType("", "number")).toBe("");
  });
});

describe("inputRestrictionLabels", () => {
  it("모든 타입에 대한 라벨이 정의되어 있다", () => {
    const types = [
      "korean",
      "english",
      "number",
      "currency",
      "alphanumeric",
      "phone",
      "phoneIntl",
      "username",
    ] as const;
    for (const type of types) {
      expect(inputRestrictionLabels[type]).toBeDefined();
      expect(typeof inputRestrictionLabels[type]).toBe("string");
    }
  });
});

describe("inputModes", () => {
  it("number 타입은 numeric inputMode를 가진다", () => {
    expect(inputModes.number).toBe("numeric");
  });

  it("phone 타입은 tel inputMode를 가진다", () => {
    expect(inputModes.phone).toBe("tel");
  });

  it("english 타입은 text inputMode를 가진다", () => {
    expect(inputModes.english).toBe("text");
  });
});

import { renderHook, act } from "@testing-library/react";
import { useRestrictedInput } from "./use-restricted-input";

describe("useRestrictedInput", () => {
  it("초기값으로 초기화된다", () => {
    const { result } = renderHook(() =>
      useRestrictedInput("english", { initialValue: "hello" })
    );

    expect(result.current.value).toBe("hello");
    expect(result.current.displayValue).toBe("hello");
  });

  it("입력 제한 타입에 맞지 않는 문자는 필터링된다 (english)", () => {
    const { result } = renderHook(() => useRestrictedInput("english"));

    act(() => {
      // @ts-expect-error: Mocking event object
      result.current.onChange({ target: { value: "Popcorn123" } });
    });

    expect(result.current.value).toBe("Popcorn");
    expect(result.current.displayValue).toBe("Popcorn");
  });

  it("maxLength를 초과하면 잘린다", () => {
    const { result } = renderHook(() =>
      useRestrictedInput("number", { maxLength: 5 })
    );

    act(() => {
      // @ts-expect-error: Mocking event object
      result.current.onChange({ target: { value: "1234567890" } });
    });

    expect(result.current.value).toBe("12345");
  });

  it("currency 타입은 콤마가 포맷팅된다", () => {
    const { result } = renderHook(() => useRestrictedInput("currency"));

    act(() => {
      // @ts-expect-error: Mocking event object
      result.current.onChange({ target: { value: "1234567" } });
    });

    expect(result.current.displayValue).toBe("1,234,567");
    expect(result.current.value).toBe("1234567"); // 저장된 실제 값은 콤마 없음
  });

  it("onValueChange 콜백이 호출된다", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useRestrictedInput("korean", { onValueChange })
    );

    act(() => {
      // @ts-expect-error: Mocking event object
      result.current.onChange({ target: { value: "안녕하세요abc" } });
    });

    expect(onValueChange).toHaveBeenCalledWith("안녕하세요");
  });

  it("reset을 호출하면 초기값으로 돌아간다", () => {
    const { result } = renderHook(() =>
      useRestrictedInput("english", { initialValue: "init" })
    );

    act(() => {
      // @ts-expect-error: Mocking event object
      result.current.onChange({ target: { value: "changed" } });
    });
    expect(result.current.value).toBe("changed");

    act(() => {
      result.current.reset();
    });
    expect(result.current.value).toBe("init");
  });

  it("setValue로 값을 직접 설정할 수 있다", () => {
    const { result } = renderHook(() => useRestrictedInput("english"));

    act(() => {
      result.current.setValue("direct");
    });

    expect(result.current.value).toBe("direct");
  });
});
