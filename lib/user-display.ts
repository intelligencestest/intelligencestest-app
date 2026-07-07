export function initialsFor(name?: string, email?: string) {
  if (name) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return email?.slice(0, 2).toUpperCase() ?? "IT";
}
