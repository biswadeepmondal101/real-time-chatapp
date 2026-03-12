export function formatMessageTime(data) {
  const date = new Date(data);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const amOrPm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formattedHours}:${formattedMinutes} ${amOrPm}`;
}

export const formatLastSeen = (lastActive) => {
  const now = new Date();
  const last = new Date(lastActive);

  const diff = now - last;
  const oneDay = 24 * 60 * 60 * 1000;

  const time = last.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diff < oneDay && now.getDate() === last.getDate()) {
    return `Last seen today at ${time}`;
  }

  if (diff < oneDay * 2 && now.getDate() - last.getDate() === 1) {
    return `Last seen yesterday at ${time}`;
  }

  const days = Math.floor(diff / oneDay);

  if (days < 7) {
    return `Last seen ${days} days ago`;
  }

  return `Last seen ${last.toLocaleDateString()}`;
};
