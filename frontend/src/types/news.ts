export interface NewsListItem {
    id: number;
    title: string;
    text: string;
    published_at: string;
    visit_count: number;
    author_id: number;
    author_first_name: string;
    author_last_name: string;
    category_id: number;
    category_name: string;
    reaction_count?: number;
}

export interface Comment {
    id: number;
    author_name: string;
    text: string;
    created_at: string;
    likes: number;
    dislikes: number;
}

export interface NewsDetails extends NewsListItem {
    tags: string[];
    comments: Comment[];
    reactions: {
        likes: number;
        dislikes: number;
    };
}