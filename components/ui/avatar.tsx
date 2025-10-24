"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

interface AvatarFallbackProps
  extends React.ComponentProps<typeof AvatarPrimitive.Fallback> {
  avatarId?: string;
}

function AvatarFallback({
  className,
  avatarId,
  children,
  ...props
}: AvatarFallbackProps) {
  // Map avatar IDs to their cropped image paths
  const getCroppedAvatarPath = (id?: string) => {
    if (!id) return null;

    const avatarMap: Record<string, string> = {
      bartek: "/avatars/konsultant_Bartek_cropped.webp",
      anastazja: "/avatars/konsultantka_Anastazja_cropped.webp",
      mateusz: "/avatars/konsultant_Mateusz_cropped.webp",
      czarek: "/avatars/konsultant_Czarek_cropped.webp",
    };

    return avatarMap[id.toLowerCase()] || null;
  };

  const croppedImagePath = getCroppedAvatarPath(avatarId);

  // If we have a cropped avatar, render it as an image
  if (croppedImagePath) {
    return (
      <AvatarPrimitive.Fallback
        data-slot="avatar-fallback"
        className={cn(
          "flex size-full items-center justify-center rounded-full overflow-hidden",
          className
        )}
        {...props}
      >
        <img
          src={croppedImagePath}
          alt="Avatar"
          className="size-full object-cover"
        />
      </AvatarPrimitive.Fallback>
    );
  }

  // Otherwise render the default fallback (emoji or initials)
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    >
      {children}
    </AvatarPrimitive.Fallback>
  );
}

export { Avatar, AvatarImage, AvatarFallback };
