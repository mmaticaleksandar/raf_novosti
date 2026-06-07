export interface News {
    id: number;
    title: string;
    text: string;
    published_at: Date;
    visit_count: number;
    author_id: number;
    category_id: number;
    created_at: Date;
    updated_at: Date;
}

export interface NewsListItem {
    id: number;
    title: string;
    text: string;
    published_at: Date;
    visit_count: number;
    author_id: number;
    author_first_name: string;
    author_last_name: string;
    category_id: number;
    category_name: string;
}