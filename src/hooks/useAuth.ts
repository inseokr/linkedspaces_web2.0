import { useState, useEffect } from "react";

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const userLoggedIn = user !== null;

    // 비동기적으로 상태 업데이트를 지연시켜서 문제 해결
    setTimeout(() => {
      setIsLoggedIn(userLoggedIn);
    }, 0); // 0ms 후에 상태를 업데이트하여 동기적 호출을 피함
  }, []); // 빈 배열로, 컴포넌트가 마운트될 때 한 번만 실행되도록

  return isLoggedIn;
}
