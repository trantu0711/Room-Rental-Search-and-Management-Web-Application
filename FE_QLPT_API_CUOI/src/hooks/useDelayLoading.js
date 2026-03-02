import { useState, useEffect } from 'react';

export const useDelayLoading = (isLoading, delay = 300) => {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let timer;

    if (isLoading) {
      // Nếu bắt đầu load, set thời gian chờ (delay)
      timer = setTimeout(() => {
        setShowLoading(true);
      }, delay);
    } else {
      // Nếu load xong (isLoading = false)
      // Xóa bộ đếm giờ ngay lập tức và tắt loading
      clearTimeout(timer);
      setShowLoading(false);
    }

    return () => clearTimeout(timer); // Cleanup khi component unmount
  }, [isLoading, delay]);

  return showLoading;
};