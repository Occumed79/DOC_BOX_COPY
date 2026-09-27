"use client";

import type { TargetAndTransition } from "motion/react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

const initialProps: TargetAndTransition = {
  pathLength: 0,
  opacity: 0,
};

const animateProps: TargetAndTransition = {
  pathLength: 1,
  opacity: 1,
};

type Props = React.ComponentProps<typeof motion.svg> & {
  speed?: number;
  onAnimationComplete?: () => void;
};

function AppleHelloEnglishEffect({
  className,
  speed = 1,
  onAnimationComplete,
  ...props
}: Props) {
  const calc = (x: number) => x * speed;

  return (
    <motion.svg
      className={cn("h-20", className)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 638 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="14.8883"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      <title>hello</title>

      <motion.path
        d="M8.69214 166.553C36.2393 151.239 61.3409 131.548 89.8191 98.0295C109.203 75.1488 119.625 49.0228 120.122 31.0026C120.37 17.6036 113.836 7.43883 101.759 7.43883C88.3598 7.43883 79.9231 17.6036 74.7122 40.9363C69.005 66.5793 64.7866 96.0036 54.1166 190.356"
        style={{ strokeLinecap: "round" }}
        initial={initialProps}
        animate={animateProps}
        transition={{
          duration: calc(0.8),
          ease: "easeInOut",
          opacity: { duration: 0.4 },
        }}
      />

      <motion.path
        d="M55.1624 181.135C60.6251 133.114 81.4118 98.0479 107.963 98.0479C123.844 98.0479 133.937 110.703 131.071 128.817C129.457 139.487 127.587 150.405 125.408 163.06C122.869 178.941 130.128 191.348 152.122 191.348C184.197 191.348 219.189 173.523 237.097 145.915C243.198 136.509 245.68 128.073 245.928 119.884C246.176 104.996 237.739 93.8296 222.851 93.8296C203.992 93.8296 189.6 115.17 189.6 142.465C189.6 171.745 205.481 192.341 239.208 192.341C285.066 192.341 335.86 137.292 359.199 75.8585C365.788 58.513 368.26 42.4065 368.26 31.1512C368.26 17.8057 364.042 7.55823 352.131 7.55823C340.469 7.55823 332.777 16.6141 325.829 30.9129C317.688 47.4967 311.667 71.4162 309.203 98.4549C303 166.301 316.896 191.348 349.936 191.348C390 191.348 434.542 135.534 457.286 75.6686C463.803 58.513 466.275 42.4065 466.275 31.1512C466.275 17.8057 462.057 7.55823 450.146 7.55823C438.484 7.55823 430.792 16.6141 423.844 30.9129C415.703 47.4967 409.682 71.4162 407.218 98.4549C401.015 166.301 414.911 191.348 444.416 191.348C473.874 191.348 489.877 165.67 499.471 138.402C508.955 111.447 520.618 94.8221 544.935 94.8221C565.035 94.8221 580.916 109.71 580.916 137.75C580.916 168.768 560.792 192.093 535.362 192.341C512.984 192.589 498.285 174.475 499.774 147.179C501.511 116.907 519.873 94.8221 543.943 94.8221C557.839 94.8221 569.51 100.999 578.682 107.725C603.549 125.866 622.709 114.656 630.047 96.7186"
        style={{ strokeLinecap: "round" }}
        initial={initialProps}
        animate={animateProps}
        transition={{
          duration: calc(2.8),
          ease: "easeInOut",
          delay: calc(0.7),
          opacity: { duration: 0.7, delay: calc(0.7) },
        }}
        onAnimationComplete={onAnimationComplete}
      />
    </motion.svg>
  );
}

function AppleClickToEnterEffect({
  className,
  speed = 1,
  onAnimationComplete,
  ...props
}: Props) {
  const calc = (x: number) => x * speed;

  return (
    <motion.svg
      className={cn("h-20", className)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-8 -16 1016 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="14.8883"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      <title>Click to enter</title>

      <motion.path
        d="M128 34C94 9 48 20 30 55C13 90 38 122 77 119C111 117 137 97 152 73
           M170 111C180 86 191 56 202 25C207 10 219 10 216 28C212 55 199 85 190 105C204 83 220 70 237 70C253 70 253 84 247 97C243 107 247 116 258 116C270 116 282 105 290 93
           M300 83C307 70 316 67 321 74C326 82 319 96 316 105C313 114 320 118 328 116C337 114 346 105 352 95
           M380 79C369 66 345 67 338 86C331 104 344 118 361 117C377 116 391 105 401 91
           M412 111C421 84 429 56 438 27C443 11 455 12 452 29C448 54 439 78 427 97C442 79 457 70 471 71C486 72 481 85 467 92C480 96 487 111 499 114C509 116 520 107 527 96"
        style={{ strokeLinecap: "round", strokeLinejoin: "round" }}
        initial={initialProps}
        animate={animateProps}
        transition={{
          duration: calc(2.8),
          ease: "easeInOut",
          opacity: { duration: 0.7 },
        }}
      />

      <motion.path
        d="M558 79C575 75 593 74 611 75
           M590 48C586 68 581 88 577 104C574 115 582 120 593 116C606 112 617 101 624 90
           M640 92C643 75 658 68 671 74C684 80 686 97 677 109C669 121 652 122 643 113C637 107 637 100 640 92
           M717 94C725 76 747 69 760 78C772 86 764 98 748 101C738 103 729 101 724 98C728 115 745 122 762 117C778 113 790 102 797 92
           M805 115C810 98 815 82 820 72C824 83 823 98 819 110C828 91 842 72 857 72C870 72 870 87 864 101C859 113 864 119 875 117C886 115 897 104 904 94
           M911 79C928 75 946 74 964 75
           M943 48C939 68 934 88 930 104C927 115 935 120 946 116C958 112 969 101 976 90
           M704 117C714 115 720 108 724 101
           M796 117C806 113 813 106 819 98
           M975 115C986 111 994 102 998 94"
        style={{ strokeLinecap: "round", strokeLinejoin: "round" }}
        initial={initialProps}
        animate={animateProps}
        transition={{
          duration: calc(2.8),
          ease: "easeInOut",
          delay: calc(0.7),
          opacity: { duration: 0.7, delay: calc(0.7) },
        }}
        onAnimationComplete={onAnimationComplete}
      />
    </motion.svg>
  );
}

function AppleHelloEnterEffect({
  className,
  speed = 1,
}: {
  className?: string;
  speed?: number;
}) {
  return (
    <div className={className}>
      <div className="apple-enter-line apple-enter-line-hello">
        <AppleHelloEnglishEffect className="apple-enter-hello-line" speed={speed} />
      </div>
      <div className="apple-enter-line apple-enter-line-click">
        <AppleClickToEnterEffect className="apple-enter-click-line" speed={speed} />
      </div>
    </div>
  );
}

export { AppleHelloEnglishEffect, AppleClickToEnterEffect, AppleHelloEnterEffect };
