"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";

type CategoryCardProps = {
  id: string;
  name: string;
  imageUrl: string;
};

const CategoryCard = ({ id, name, imageUrl }: CategoryCardProps) => {
  return (
    <Link
      href={`/category/${id}`}
      className="category-card relative rounded-xl overflow-hidden transition-all h-48 block"
    >
      {/* Image */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
        />
      </div>

      {/* Text */}
      <div className="absolute bottom-0 left-0 w-full p-4 text-white z-10">
        <h3 className="font-semibold text-lg">{name}</h3>
      </div>
    </Link>
  );
};

export default CategoryCard;
