"use client";

import React, { ReactNode, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Mousewheel, Keyboard } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Swiper as SwiperInstance } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type CarouselProps = {
  children: ReactNode[];
  slidesPerView?: number;
  spaceBetween?: number;
  navigation?: boolean;
  pagination?: boolean;
  breakpoints?: {
    [width: number]: {
      slidesPerView: number;
      spaceBetween: number;
    };
  };
  className?: string;
};

const Carousel = ({
  children,
  slidesPerView = 1,
  spaceBetween = 10,
  navigation = true,
  pagination = false,
  breakpoints,
  className = "",
}: CarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const totalSlides = children.length;
  const swiperInstance = useRef<SwiperInstance>();

  const handleSwiperInit = (swiper: SwiperInstance) => {
    swiperInstance.current = swiper;
  };

  return (
    <div className={`carousel-container relative overflow-hidden ${className}`}>
      <Swiper
        modules={[Navigation, Pagination, Mousewheel, Keyboard]}
        spaceBetween={spaceBetween}
        slidesPerView={slidesPerView}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        pagination={false} // Disable default pagination
        mousewheel={true}
        keyboard={{ enabled: true }}
        grabCursor={true}
        breakpoints={breakpoints}
        className="w-full"
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        onSwiper={handleSwiperInit}
      >
        {children.map((slide, index) => (
          <SwiperSlide key={index} className="overflow-hidden">
            {slide}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom pagination below the carousel */}
      {pagination && totalSlides > 1 && (
        <div className="flex justify-center mt-4">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (swiperInstance.current) {
                  swiperInstance.current.slideTo(index);
                }
              }}
              className={`inline-block w-2 h-2 rounded-full mx-1 transition-all cursor-pointer ${
                index === activeIndex
                  ? "bg-primary opacity-100"
                  : "bg-gray-300 opacity-70 hover:opacity-90"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {navigation && (
        <>
          <button className="swiper-button-prev absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 rounded-r-lg p-3 shadow-md hover:bg-white transition-all">
            <ChevronLeft className="w-6 h-6 text-primary" />
          </button>
          <button className="swiper-button-next absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 rounded-l-lg p-3 shadow-md hover:bg-white transition-all">
            <ChevronRight className="w-6 h-6 text-primary" />
          </button>
        </>
      )}
    </div>
  );
};

export default Carousel;
