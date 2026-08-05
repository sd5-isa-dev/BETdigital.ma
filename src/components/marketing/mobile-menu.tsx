"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/functions";
import { useClickOutside } from "@/hooks";
import { motion } from "framer-motion";
import { 
    Briefcase, 
    Building2Icon, 
    CircleHelp, 
    FolderOpen, 
    Info, 
    LayersIcon, 
    Newspaper, 
    Phone, 
    RouteIcon, 
    UsersIcon 
} from "lucide-react";
import Link from "next/link";
import React from 'react';

interface Props {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MobileMenu = ({ isOpen, setIsOpen }: Props) => {

    const ref = useClickOutside(() => setIsOpen(false));

    const variants = {
        open: { opacity: 1, y: 20 },
        closed: { opacity: 0, y: 0 },
    };

    return (
        <div
            ref={ref}
            className={cn(
                "absolute top-12 inset-x-0 size-full p-4 z-20 bg-inherit flex flex-1",
                isOpen ? "flex" : "hidden"
            )}
        >
            <motion.div
                initial="closed"
                animate={isOpen ? "open" : "closed"}
                variants={variants}
                transition={{
                    type: "spring",
                    bounce: 0.15,
                    duration: 0.5,
                }}
                className="size-full flex flex-col justify-start"
            >
                <ul className="flex flex-col items-start flex-1 w-full space-y-3">
                    <li
                        onClick={() => setIsOpen(false)}
                        className="w-full px-4 py-2 text-lg hover:text-muted-foreground font-normal transition transform rounded-md cursor-pointer text-foreground text-start active:scale-95 hover:bg-muted/20 active:opacity-80"
                    >
                        <Link href="/solutions-btp" className="flex items-center w-full text-start">
                            <Briefcase className="w-4 h-4 mr-2" />
                            Solutions BTP
                        </Link>
                    </li>
                    
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="border-transparent">
                            <AccordionTrigger className="px-4 py-2 text-lg hover:text-muted-foreground font-normal">
                                <span className="flex items-center">
                                    <UsersIcon className="w-4 h-4 mr-2" />
                                    Sous-traitance
                                </span>
                            </AccordionTrigger>
                            <AccordionContent onClick={() => setIsOpen(false)} className="flex flex-col items-start gap-1 mt-1">
                                <li className="w-full px-4 py-2 text-lg font-normal transition transform rounded-md cursor-pointer text-foreground/80 hover:text-muted-foreground text-start active:scale-95 hover:bg-muted/20 active:opacity-80">
                                    <Link href="/expertise/batiment" className="flex items-center w-full text-start">
                                        <Building2Icon className="w-4 h-4 mr-2" />
                                        L'Expertise Bâtiment
                                    </Link>
                                </li>
                                <li className="w-full px-4 py-2 text-lg font-normal transition transform rounded-md cursor-pointer text-foreground/80 hover:text-muted-foreground text-start active:scale-95 hover:bg-muted/20 active:opacity-80">
                                    <Link href="/expertise/route-infrastructure" className="flex items-center w-full text-start">
                                        <RouteIcon className="w-4 h-4 mr-2" />
                                        L'Expertise Route & Infrastructure
                                    </Link>
                                </li>
                                <li className="w-full px-4 py-2 text-lg font-normal transition transform rounded-md cursor-pointer text-foreground/80 hover:text-muted-foreground text-start active:scale-95 hover:bg-muted/20 active:opacity-80">
                                    <Link href="/expertise/vrd-bim" className="flex items-center w-full text-start">
                                        <LayersIcon className="w-4 h-4 mr-2" />
                                        L'Expertise VRD ou BIM
                                    </Link>
                                </li>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <li
                        onClick={() => setIsOpen(false)}
                        className="w-full px-4 py-2 text-lg hover:text-muted-foreground font-normal transition transform rounded-md cursor-pointer text-foreground text-start active:scale-95 hover:bg-muted/20 active:opacity-80"
                    >
                        <Link href="/projets" className="flex items-center w-full text-start">
                            <FolderOpen className="w-4 h-4 mr-2" />
                            Projets
                        </Link>
                    </li>
                    <li
                        onClick={() => setIsOpen(false)}
                        className="w-full px-4 py-2 text-lg hover:text-muted-foreground font-normal transition transform rounded-md cursor-pointer text-foreground text-start active:scale-95 hover:bg-muted/20 active:opacity-80"
                    >
                        <Link href="/a-propos" className="flex items-center w-full text-start">
                            <Info className="w-4 h-4 mr-2" />
                            À Propos
                        </Link>
                    </li>

                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-2" className="border-transparent">
                            <AccordionTrigger className="px-4 py-2 text-lg hover:text-muted-foreground font-normal">
                                <span className="flex items-center">
                                    <Phone className="w-4 h-4 mr-2" />
                                    Contact
                                </span>
                            </AccordionTrigger>
                            <AccordionContent onClick={() => setIsOpen(false)} className="flex flex-col items-start gap-1 mt-1">
                                <li className="w-full px-4 py-2 text-lg font-normal transition transform rounded-md cursor-pointer text-foreground/80 hover:text-muted-foreground text-start active:scale-95 hover:bg-muted/20 active:opacity-80">
                                    <Link href="/contact/demande-etude" className="flex items-center w-full text-start">
                                        <Newspaper className="w-4 h-4 mr-2" />
                                        Demande d'Étude
                                    </Link>
                                </li>
                                <li className="w-full px-4 py-2 text-lg font-normal transition transform rounded-md cursor-pointer text-foreground/80 hover:text-muted-foreground text-start active:scale-95 hover:bg-muted/20 active:opacity-80">
                                    <Link href="/contact/support" className="flex items-center w-full text-start">
                                        <CircleHelp className="w-4 h-4 mr-2" />
                                        Assistance Technique
                                    </Link>
                                </li>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </ul>
            </motion.div>
        </div>
    )
};

export default MobileMenu;