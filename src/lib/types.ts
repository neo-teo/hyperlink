// src/lib/types.ts

export type Link = {
    url: string;
    label: string;
};

export type Page = {
    url: string;
    title: string;
    links: {
        internal: Link[];
        external: Link[];
    };
};

export type Visit = {
    id: string;
    url: string;
    via?: string;
    position: {
        x: number;
        y: number;
    };
};