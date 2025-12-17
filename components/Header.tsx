"use client";

interface HeaderProps {
  fullName: string;
}

export default function Header({ fullName }: HeaderProps) {
  return (
    <header className="flex justify-between items-center mb-6 bg-white p-4 rounded shadow">
      <h1 className="text-2xl font-bold">Bienvenue, {fullName}</h1>
      <img
        src="../public/img.jpg"
        alt="Avatar"
        className="w-12 h-12 rounded-full border-2 border-gray-300"
      />
    </header>
  );
}
