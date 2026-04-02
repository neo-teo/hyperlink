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
    images: string[];
};

export type Visit = {
    id: string;
    url: string;
    via?: string;
    position: {
        x: number;
        y: number;
    };
    title?: string;
    timestamp?: string;
};

export type WalkSession = {
    id: string;
    createdAt: string;
    updatedAt: string;
    visits: Visit[];
    pages: Record<string, Page>; // visitId → Page (mirrors walk.pages)
};