"use client";

import React, {
    ComponentPropsWithoutRef,
    ReactNode,
    useEffect,
    useMemo,
    useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "../../lib/utils";

export function AnimatedListItem({ children }: { children: React.ReactNode }) {
    const animations = {
        initial: { scale: 0.85, opacity: 0, y: -24, filter: "blur(6px)" },
        animate: { scale: 1, opacity: 1, y: 0, filter: "blur(0px)", originY: 0 },
        exit: { scale: 0.9, opacity: 0, y: 12, filter: "blur(4px)" },
        transition: {
            type: "spring" as const,
            stiffness: 260,
            damping: 24,
            mass: 0.9,
            opacity: { duration: 0.25 },
            filter: { duration: 0.35 },
        },
    };

    return (
        <motion.div {...animations} layout="position" className="mx-auto w-full">
            {children}
        </motion.div>
    );
}

export interface AnimatedListProps extends ComponentPropsWithoutRef<"div"> {
    children: ReactNode;
    /** Delay in ms between each new item appearing. Defaults to 1500ms. */
    delay?: number;
}

export const AnimatedList = React.memo(
    ({ children, className, delay = 1500, ...props }: AnimatedListProps) => {
        const [index, setIndex] = useState(0);
        const childrenArray = useMemo(
            () => React.Children.toArray(children),
            [children]
        );

        useEffect(() => {
            if (childrenArray.length === 0) return;

            const timeout = setTimeout(() => {
                setIndex((prevIndex) => (prevIndex + 1) % childrenArray.length);
            }, delay);

            return () => clearTimeout(timeout);
        }, [index, delay, childrenArray.length]);

        const itemsToShow = useMemo(() => {
            return childrenArray.slice(0, index + 1).reverse();
        }, [index, childrenArray]);

        return (
            <div
                className={cn("flex flex-col items-center gap-3", className)}
                {...props}
            >
                <AnimatePresence mode="popLayout">
                    {itemsToShow.map((item) => (
                        <AnimatedListItem key={(item as React.ReactElement).key}>
                            {item}
                        </AnimatedListItem>
                    ))}
                </AnimatePresence>
            </div>
        );
    }
);

AnimatedList.displayName = "AnimatedList";