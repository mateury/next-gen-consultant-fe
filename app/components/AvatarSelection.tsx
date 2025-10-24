"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { Check } from "lucide-react";

interface AvatarType {
  id: string;
  name: string;
  imageUrl: string;
}

const avatars: AvatarType[] = [
  {
    id: "bartek",
    name: "Bartek",
    imageUrl: "/avatars/konsultant_Bartek.webp",
  },
  {
    id: "anastazja",
    name: "Anastazja",
    imageUrl: "/avatars/konsultantka_Anastazja.webp",
  },
  {
    id: "mateusz",
    name: "Mateusz",
    imageUrl: "/avatars/konsultant_Mateusz.webp",
  },
  {
    id: "czarek",
    name: "Czarek",
    imageUrl: "/avatars/konsultant_Czarek.webp",
  },
];

const AvatarSelection = () => {
  const { user, updateUserAvatar } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (avatar: AvatarType) => {
    setSelectedId(avatar.id);
    updateUserAvatar(avatar);
  };

  return (
    <div className="h-screen w-full bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-7xl flex flex-col justify-center">
        <div className="text-center mb-8">
          {user?.firstName && user?.lastName && (
            <p className="text-2xl mb-2">
              {user.firstName} {user.lastName}
            </p>
          )}
          <h1 className="text-4xl font-bold">Wybierz Doradcę Play</h1>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {avatars.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => handleSelect(avatar)}
              className={`relative overflow-hidden rounded-2xl transition-all ${
                selectedId === avatar.id
                  ? "ring-4 ring-purple-600 scale-105"
                  : "ring-2 ring-gray-200 hover:ring-purple-400 hover:scale-[1.02]"
              }`}
            >
              <div className="relative w-full h-96">
                <Image
                  src={avatar.imageUrl}
                  alt={avatar.name}
                  fill
                  className="object-cover"
                />
                {selectedId === avatar.id && (
                  <div className="absolute inset-0 bg-purple-600/30 flex items-center justify-center">
                    <Check className="w-16 h-16 text-white drop-shadow-lg" />
                  </div>
                )}
              </div>
              <div className="bg-white dark:bg-gray-800 p-4">
                <p className="text-center text-xl font-semibold">
                  {avatar.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvatarSelection;
