export const haptic = {
  add: () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(30);
    }
  },
  remove: () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([20, 10, 20]);
    }
  },
  send: () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([50, 30, 100]);
    }
  },
};
